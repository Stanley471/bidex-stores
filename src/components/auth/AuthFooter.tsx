import Link from 'next/link'

interface AuthFooterProps {
  text: string
  linkHref: string
  linkText: string
}

export function AuthFooter({ text, linkHref, linkText }: AuthFooterProps) {
  return (
    <p className="text-center text-xs sm:text-sm text-slate-600">
      {text}{' '}
      <Link href={linkHref} className="font-bold text-brand-primary hover:text-brand-secondary underline-offset-4 hover:underline">
        {linkText}
      </Link>
    </p>
  )
}
