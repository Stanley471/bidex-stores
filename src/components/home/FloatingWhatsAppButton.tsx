'use client'

import { useEffect, useState } from 'react'

export interface FloatingWhatsAppButtonProps {
  phoneNumber?: string | null
  storeName?: string | null
  message?: string | null
  delayMs?: number
}

/**
 * Clean phone numbers into valid international WhatsApp format
 */
function formatWhatsAppNumber(phone?: string | null): string {
  if (!phone) return '2347017483224'
  const digitsOnly = phone.replace(/\D/g, '')
  if (!digitsOnly) return '2347017483224'
  if (digitsOnly.startsWith('0')) {
    return '234' + digitsOnly.slice(1)
  }
  return digitsOnly
}

export function FloatingWhatsAppButton({
  phoneNumber,
  storeName = 'Bidex Company',
  message,
  delayMs = 1800,
}: FloatingWhatsAppButtonProps) {
  const [visible, setVisible] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    // 1.8 second entrance delay matching snippet specification
    const timer = setTimeout(() => {
      setVisible(true)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [delayMs])

  const cleanPhone = formatWhatsAppNumber(phoneNumber)
  const targetStoreName = storeName || 'Bidex Company'
  const prefilledText =
    message || `Hello ${targetStoreName}, I am interested in your products.`
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(prefilledText)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      id="floatingWhatsappBtn"
      className={`floating-whatsapp-btn group ${visible ? 'visible' : ''}`}
      aria-label={`Chat with ${targetStoreName} on WhatsApp`}
    >
      {/* Desktop hover tooltip */}
      <span className="hidden sm:inline-flex items-center gap-1.5 absolute right-full mr-3 whitespace-nowrap bg-slate-900/95 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-x-1 group-hover:translate-x-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Chat with us
      </span>

      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="https://web.whatsapp.com/favicon.ico"
          onError={() => setImgFailed(true)}
          alt="WhatsApp"
          width={34}
          height={34}
          style={{ width: 34, height: 34, objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[34px] h-[34px] text-white"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2 22l4.975-1.306A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
        </svg>
      )}
    </a>
  )
}
