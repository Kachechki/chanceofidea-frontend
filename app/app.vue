<script setup lang="ts">
const { fetchMe } = useAuth()

// Client-only: the session check runs after hydration, so no SSR cookie forwarding is needed
onMounted(() => fetchMe())
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
