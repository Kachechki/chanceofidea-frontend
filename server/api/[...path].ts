export default defineEventHandler(async (event) => {
	const { backendUrl } = useRuntimeConfig(event)
	const path = event.context.params?.path ?? ''
	const method = getMethod(event)
	const query = getQuery(event)
	const body = method === 'GET' ? undefined : await readBody(event)
	const access = getCookie(event, ACCESS)
	const refresh = getCookie(event, REFRESH)

	const call = (headers: Record<string, string> = {}) =>
		$fetch.raw(`${backendUrl}/${path}`, {
			method,
			query,
			body,
			headers,
			ignoreResponseError: true,
		})

	let res

	// 1. try fetching with Access Token if present
	if (access) {
		res = await call({ Authorization: `Bearer ${access}` })
	}

	// 2. if access failed (401) or wasn't provided, try Refresh Token
	if ((!res || res.status === 401) && refresh) {
		res = await call({ Cookie: `refresh=${refresh}` })
		const newAccess = res.headers.get('x-access-token')
		if (newAccess) setAccessCookie(event, newAccess)
	}

	// 3. if still no response (guest with no cookies), fetch publicly without headers
	if (!res) {
		res = await call()
	}

	// 4. handle remaining 401 responses from backend
	if (res.status === 401) {
		clearAuthCookies(event)
	}

	setResponseStatus(event, res.status)
	return res._data
})
