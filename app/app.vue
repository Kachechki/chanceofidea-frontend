<script setup lang="ts">
import { useBookmarksStore } from '~/stores/bookmarksStore'
const { user, fetchMe } = useAuth()
const bookmarks = useBookmarksStore()
const { t, locale } = useI18n()

watch(() => user.value?.id, (id) => bookmarks.load(id ?? null), { immediate: true })

useHead(() => ({
	htmlAttrs: { lang: locale.value },
	link: [
		{ rel: 'icon', href: '/favicon.ico', sizes: 'any' },
		{ rel: 'manifest', href: '/site.webmanifest' },
	],
	titleTemplate: (title?: string) =>
		title ? t('meta.titleWithPage', { title }) : t('meta.siteName'),
}))

useSeoMeta({
	description: () => t('meta.description'),
	ogTitle: () => t('meta.ogTitle'),
	ogDescription: () => t('meta.ogDescription'),
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
