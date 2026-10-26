<script setup lang="ts">
import { useBookmarksStore } from '~/stores/bookmarksStore'
const { user, fetchMe } = useAuth()
const bookmarks = useBookmarksStore()

watch(() => user.value?.id, (id) => bookmarks.load(id ?? null), { immediate: true })

useHead({
	htmlAttrs: { lang: 'en' },
	link: [
		{ rel: 'icon', href: '/favicon.ico', sizes: 'any' },
		{ rel: 'manifest', href: '/site.webmanifest' },
	],
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
	twitterCard: 'summary',
})

onMounted(() => fetchMe())
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
