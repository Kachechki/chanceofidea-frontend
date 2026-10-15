import type { H3Event } from 'h3'

export const ACCESS = 'access_token'
export const REFRESH = 'refresh_token'

const base = () => ({
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: process.env.NODE_ENV === 'production',
	path: '/',
})

export const setAccessCookie = (event: H3Event, token: string) =>
	setCookie(event, ACCESS, token, { ...base(), maxAge: 60 * 15 })

export const setRefreshCookie = (event: H3Event, token: string) =>
	setCookie(event, REFRESH, token, { ...base(), maxAge: 60 * 60 * 24 * 5 })

export const clearAuthCookies = (event: H3Event) => {
	deleteCookie(event, ACCESS, { path: '/' })
	deleteCookie(event, REFRESH, { path: '/' })
}
