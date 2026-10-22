import type { H3Event } from 'h3'

// the backend only accepts the refresh cookie (AuthGuard), so it is the whole session
export const REFRESH = 'refresh_token'

const REFRESH_MAX_AGE = 60 * 60 * 24 * 5

export const setRefreshCookie = (event: H3Event, token: string) =>
	setCookie(event, REFRESH, token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: REFRESH_MAX_AGE,
	})

export const clearAuthCookies = (event: H3Event) => {
	deleteCookie(event, REFRESH, { path: '/' })
}
