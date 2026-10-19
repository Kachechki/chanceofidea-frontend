// Reads the backend's error message (Nest puts it in data.message) with a fallback
export const errorMessage = (err: unknown, fallback: string) => {
	const data = (err as { data?: { message?: string | string[] } })?.data
	const message = Array.isArray(data?.message)
		? data?.message.join(', ')
		: data?.message
	return message || (err instanceof Error ? err.message : fallback)
}
