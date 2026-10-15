export default defineEventHandler(async (event) => {
	const { code } = await readBody<{ code: string }>(event)
	const { backendUrl } = useRuntimeConfig(event)

	const res = await $fetch.raw(`${backendUrl}/auth/oauth_callback`, {
		query: { code },
		ignoreResponseError: true,
	})

	const access = res.headers.get('access')
	const refresh = res.headers.get('refresh')
	if (!res.ok || !access || !refresh) {
		throw createError({ statusCode: 401, statusMessage: 'GitHub login failed' })
	}

	setAccessCookie(event, access)
	setRefreshCookie(event, refresh)
	return { ok: true }
})
