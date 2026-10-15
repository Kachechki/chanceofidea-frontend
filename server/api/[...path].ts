export default defineEventHandler(async (event) => {
	const { backendUrl } = useRuntimeConfig(event)
	const path = event.context.params?.path ?? ''
	const method = getMethod(event)
	const query = getQuery(event)
	const body = method === 'GET' ? undefined : await readBody(event)
	const access = getCookie(event, ACCESS)
	const refresh = getCookie(event, REFRESH)

	const call = (headers: Record<string, string>) =>
		$fetch.raw(`${backendUrl}/${path}`, {
			method,
			query,
			body,
			headers,
			ignoreResponseError: true,
		})

	// Send only one credential. The backend returns 403 when both are present.
	let res = access
		? await call({ Authorization: `Bearer ${access}` })
		: undefined

	// No access token, or it expired: fall back to the refresh cookie.
	if ((!res || res.status === 401) && refresh) {
		res = await call({ Cookie: `refresh=${refresh}` })
		const newAccess = res.headers.get('x-access-token')
		if (newAccess) setAccessCookie(event, newAccess)
	}

	if (!res) throw createError({ statusCode: 401, statusMessage: 'Not logged in' })
	if (res.status === 401) clearAuthCookies(event)

	setResponseStatus(event, res.status)
	return res._data
})
