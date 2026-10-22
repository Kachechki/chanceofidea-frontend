export default defineEventHandler(async (event) => {
	const { backendUrl } = useRuntimeConfig(event)
	const path = event.context.params?.path ?? ''
	const method = getMethod(event)
	const query = getQuery(event)
	const body = method === 'GET' ? undefined : await readBody(event)
	const refresh = getCookie(event, REFRESH)

	// the backend guard only accepts the refresh cookie. a bearer header alone is rejected,
	// and sending both returns 403. guests send no cookie, so public routes still work.
	const res = await $fetch.raw(`${backendUrl}/${path}`, {
		method,
		query,
		body,
		headers: refresh ? { Cookie: `refresh=${refresh}` } : {},
		ignoreResponseError: true,
	})

	// an expired or revoked refresh token means the session is over
	if (res.status === 401 && refresh) clearAuthCookies(event)

	setResponseStatus(event, res.status)
	return res._data
})
