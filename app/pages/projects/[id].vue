<script setup lang="ts">
import { Button } from '~/widgets/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/widgets/ui/card'
import { LoaderCircle } from '@lucide/vue'

const { user, ready } = useAuth()
const projectsStore = useProjectsStore()
const route = useRoute()
const error = ref('')
const loading = ref(true)
const project = computed(() => projectsStore.currentProject)

onMounted(async () => {
	const id = String(route.params.id ?? '')
	console.log('id', id, route.params)
	if (id == null) {
		error.value = 'Id not provided'
		loading.value = false
		return
	}
	try {
		const returned = await projectsStore.fetchProjectById(id)
		if (returned == null) throw new Error('Project not found')
	} catch {
		error.value = 'Project not found'
	} finally {
		loading.value = false
	}
})

const formatGithubUrl = (url: string) => {
	if (!url) return null

	// Captures the two segments following github.com
	const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)/i)

	if (match) {
		const user = match[1]
		const repo = match[2]?.replace(/\.git\$/, '') // Strips .git if it exists
		return `${user}/${repo}`
	}

	// Optional: If the input is already in 'user/repo' format, return it as-is
	if (/^[\w-]+\/[\w-]+\$/.test(url)) {
		return url
	}

	return null
}
</script>

<template>
	<div
		v-if="loading"
		class="w-full h-full flex flex-col items-center justify-center"
	>
		<LoaderCircle class="w-16 h-16 animate-spin text-muted-foreground" />
	</div>
	<div
		v-else-if="error"
		class="w-full h-full flex flex-col items-center justify-center"
	>
		<p class="text-sm text-center text-destructive">
			{{ error }}
		</p>
	</div>
	<div
		v-else
		class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8"
	>
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold text-foreground">
					{{ project?.title ?? 'Project title' }}
				</h1>
				<span
					class="px-2.5 py-1 text-xs font-mono rounded bg-secondary text-secondary-foreground"
				>
					{{ project?.status ?? 'STATUS' }}
				</span>
			</div>
			<p class="text-muted-foreground text-sm">
				{{ project?.title ?? 'Category' }}
			</p>
			<p
				v-if="error"
				class="text-sm text-center text-destructive"
			>
				{{ error }}
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div class="lg:col-span-2 flex flex-col gap-6">
				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">About</CardTitle>
					</CardHeader>
					<CardContent class="text-muted-foreground leading-relaxed">
						{{ project?.description ?? 'Description' }}
					</CardContent>
				</Card>

				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">Tags</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-wrap gap-2">
						<span
							v-for="tag in project?.tags"
							class="px-2.5 py-1 text-xs font-medium bg-accent text-secondary-foreground rounded-md"
						>
							{{ tag.name }}
						</span>
					</CardContent>
				</Card>
			</div>

			<div class="flex flex-col gap-6">
				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">Readiness</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-col gap-4">
						<div class="text-3xl font-bold text-foreground">
							{{ `${(project?.readiness ?? 0) * 100}%` }}
						</div>
						<div class="h-2 w-full rounded-full bg-muted overflow-hidden">
							<div class="h-full w-0 bg-primary" />
						</div>
					</CardContent>
				</Card>

				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">Repository</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-col gap-4">
						<p class="text-sm text-muted-foreground">
							{{ formatGithubUrl(project?.repostoryUrl ?? '') ?? 'user/repo' }}
						</p>
						<a
							:href="project?.repostoryUrl"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								variant="outline"
								class="w-full"
								>Open repository</Button
							>
						</a>
					</CardContent>
				</Card>

				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">Owner</CardTitle>
					</CardHeader>
					<CardContent class="text-sm text-muted-foreground">
						{{ project?.owner?.login ?? 'Owner login' }}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</template>
