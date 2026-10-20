<script setup lang="ts">
const { fetchMe } = useAuth()

useHead({
	htmlAttrs: { lang: 'en' },
	titleTemplate: (title) =>
		title ? `${title} · Second Chance Archive` : 'Second Chance Archive',
})

useSeoMeta({
	description:
		'Connect developers who want to pass on abandoned or unfinished side projects with adopters ready to continue the work.',
	ogTitle: 'Second Chance Archive',
	ogDescription:
		'Give your unfinished side project a second life. Browse and adopt abandoned open-source projects.',
	ogType: 'website',
})

onMounted(() => fetchMe())
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
