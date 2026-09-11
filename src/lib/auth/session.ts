export const AUTH_COOKIE_NAME = 'auth_token'

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

export interface CookieSetter {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  set(name: string, value: string, options?: any): any
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  delete?: (...args: any[]) => any
}

// Centralize cookie behavior so all authentication routes reuse the same secure defaults.
export function setAuthCookie(cookieStore: CookieSetter, token: string) {
  cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)
}

export function getAuthCookie(cookieStore: { get(name: string): { value: string } | undefined }): string | undefined {
  return cookieStore.get(AUTH_COOKIE_NAME)?.value
}

export function clearAuthCookie(cookieStore: CookieSetter) {
  if (typeof cookieStore.delete === 'function') {
    cookieStore.delete(AUTH_COOKIE_NAME)
    return
  }

  cookieStore.set(AUTH_COOKIE_NAME, '', {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  })
}
