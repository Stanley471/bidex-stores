'use client'

import { useEffect, useState, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const emptySubscribe = () => () => {}
function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function NavigationOverlay() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [navigating, setNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [targetLabel, setTargetLabel] = useState('Loading...')
  const currentRoute = useRef(pathname + searchParams.toString())

  // Hide overlay when route changes
  useEffect(() => {
    const newRoute = pathname + searchParams.toString()
    if (newRoute !== currentRoute.current) {
      currentRoute.current = newRoute
      setProgress(100)
      const timer = setTimeout(() => {
        setNavigating(false)
        setProgress(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Listen for clicks on links across the app
  useEffect(() => {
    let interval: NodeJS.Timeout

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement
      if (!target || !target.href) return

      const url = new URL(target.href, window.location.origin)
      const isSameOrigin = url.origin === window.location.origin
      const isDifferentRoute = url.pathname !== window.location.pathname || url.search !== window.location.search

      // Ignore modifier keys, target="_blank", or hash-only links
      if (
        !isSameOrigin ||
        !isDifferentRoute ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        target.target === '_blank' ||
        url.pathname.startsWith('/api/')
      ) {
        return
      }

      // Determine human-readable label based on destination
      let label = 'Loading page...'
      if (url.pathname.startsWith('/products/')) {
        label = 'Loading product details...'
      } else if (url.pathname === '/products') {
        label = 'Loading catalog...'
      } else if (url.pathname.startsWith('/orders')) {
        label = 'Loading order details...'
      } else if (url.pathname === '/cart' || url.pathname === '/checkout') {
        label = 'Loading checkout...'
      }

      setTargetLabel(label)
      setNavigating(true)
      setProgress(20)

      // Simulate progress bar increments
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + Math.floor(Math.random() * 15) + 5
        })
      }, 150)
    }

    const handleCustomStartNav = (e: Event) => {
      const customEvt = e as CustomEvent<{ label?: string }>
      const label = customEvt.detail?.label || 'Loading...'
      setTargetLabel(label)
      setNavigating(true)
      setProgress(25)

      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + Math.floor(Math.random() * 15) + 5
        })
      }, 150)
    }

    window.addEventListener('start-navigation', handleCustomStartNav)

    // Attach click listener to all anchor elements
    const anchors = Array.from(document.querySelectorAll('a[href]'))
    anchors.forEach((anchor) => anchor.addEventListener('click', handleAnchorClick as EventListener))

    // Observer to attach click listeners to dynamically added links (e.g. infinite scroll, product cards)
    const observer = new MutationObserver(() => {
      const newAnchors = Array.from(document.querySelectorAll('a[href]'))
      newAnchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener)
        anchor.addEventListener('click', handleAnchorClick as EventListener)
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearInterval(interval)
      window.removeEventListener('start-navigation', handleCustomStartNav)
      observer.disconnect()
      anchors.forEach((anchor) => anchor.removeEventListener('click', handleAnchorClick as EventListener))
    }
  }, [pathname])

  const mounted = useHasMounted()

  if (!mounted || (!navigating && progress === 0)) return null

  if (typeof window === 'undefined') return null

  return createPortal(
    <>
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[999999] h-1.5 bg-slate-200/50 pointer-events-none">
        <div
          className="h-full bg-brand-primary transition-all duration-300 ease-out shadow-[0_0_12px_rgba(246,139,30,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Center Overlay Badge for Visual Feedback */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-2.5 rounded-full bg-slate-900/95 text-white px-4.5 py-2 text-xs font-bold shadow-2xl backdrop-blur-md border border-slate-700/60 text-slate-100">
          <Loader2 className="h-4 w-4 animate-spin text-brand-primary" aria-hidden="true" />
          <span>{targetLabel}</span>
        </div>
      </div>
    </>,
    document.body
  )
}
