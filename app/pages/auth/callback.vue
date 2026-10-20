<script setup lang="ts">
import { Button } from '~/widgets/ui/button'

useHead({ title: 'Signing in' })

const route = useRoute()
const { fetchMe } = useAuth()
const error = ref('')

onMounted(async () => {
	const expected = sessionStorage.getItem('oauth_state')
	sessionStorage.removeItem('oauth_state')

	const code = String(route.query.code ?? '')
	if (!code || !expected || route.query.state !== expected) {
		error.value = 'Invalid login response'
		return
	}

	try {
		await $fetch('/api/auth/callback', { method: 'POST', body: { code } })
		await fetchMe()
		await navigateTo('/')
	} catch {
		error.value = 'Login failed'
	}
})
</script>

<template>
	<div class="max-w-md mx-auto px-4 md:px-8 py-24 flex flex-col items-center gap-6 text-center">
		<template v-if="error">
			<p role="alert" class="text-destructive font-medium">{{ error }}</p>
			<Button as-child variant="outline">
				<NuxtLink to="/login">Back to login</NuxtLink>
			</Button>
		</template>
		<LoadingSpinner v-else />
	</div>
</template>
