<script setup lang="ts">
const { fetchMe } = useAuth()

onMounted(() => fetchMe())
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
