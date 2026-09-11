import Link from 'next/link'

interface AuthHeaderProps {
  title: string
  subtitle: string
  linkHref: string
  linkText: string
}

export function AuthHeader({ title, subtitle, linkHref, linkText }: AuthHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-600">
        {subtitle}{' '}
        <Link href={linkHref} className="font-bold text-brand-primary hover:text-brand-secondary underline-offset-4 hover:underline">
          {linkText}
        </Link>
      </p>
    </div>
  )
}
