<script setup lang="ts">
import { Button } from '~/widgets/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/widgets/ui/card'
import { LoaderCircle } from '@lucide/vue'
import { useProjectsStore } from '~/stores/projectsStore'
import { getProjectFullName, getProjectRepoUrl } from '~/lib/project'

const projectsStore = useProjectsStore()
const route = useRoute()
const error = ref('')
const loading = ref(true)
const project = computed(() => projectsStore.currentProject)

const fullName = computed(() => (project.value ? getProjectFullName(project.value) : ''))
const repoUrl = computed(() => (project.value ? getProjectRepoUrl(project.value) : '#'))
const readinessPercent = computed(() => Math.round((project.value?.readiness ?? 0) * 100))

onMounted(async () => {
	const id = String(route.params.id ?? '')
	if (!id) {
		error.value = 'Id not provided'
		loading.value = false
		return
	}
	const returned = await projectsStore.fetchProjectById(id)
	if (returned == null) error.value = 'Project not found'
	loading.value = false
})
</script>

<template>
	<div
		v-if="loading"
		class="w-full h-full flex flex-col items-center justify-center py-24"
	>
		<LoaderCircle class="w-16 h-16 animate-spin text-muted-foreground" />
	</div>
	<div
		v-else-if="error || !project"
		class="w-full h-full flex flex-col items-center justify-center py-24"
	>
		<p class="text-sm text-center text-destructive">
			{{ error || 'Project not found' }}
		</p>
	</div>
	<div
		v-else
		class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8"
	>
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold text-foreground">
					{{ project.title }}
				</h1>
				<span
					class="px-2.5 py-1 text-xs font-mono rounded bg-secondary text-secondary-foreground"
				>
					{{ project.status }}
				</span>
			</div>
			<p class="text-muted-foreground text-sm font-mono">
				{{ fullName }}
			</p>
			<p v-if="project.category" class="text-muted-foreground text-sm">
				{{ project.category.name }}
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div class="lg:col-span-2 flex flex-col gap-6">
				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">About</CardTitle>
					</CardHeader>
					<CardContent class="text-muted-foreground leading-relaxed">
						{{ project.description }}
					</CardContent>
				</Card>

				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">Tags</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-wrap gap-2">
						<span
							v-for="tag in project.tags"
							:key="tag.id"
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
							{{ readinessPercent }}%
						</div>
						<div class="h-2 w-full rounded-full bg-muted overflow-hidden">
							<div
								class="h-full bg-primary"
								:style="{ width: `${readinessPercent}%` }"
							/>
						</div>
					</CardContent>
				</Card>

				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">Repository</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-col gap-4">
						<p class="text-sm text-muted-foreground font-mono break-all">
							{{ fullName }}
						</p>
						<a
							:href="repoUrl"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								variant="outline"
								class="w-full"
							>Open repository</Button>
						</a>
					</CardContent>
				</Card>

				<Card class="rounded-2xl">
					<CardHeader>
						<CardTitle class="text-lg">Owner</CardTitle>
					</CardHeader>
					<CardContent class="text-sm text-muted-foreground">
						@{{ project.owner?.login ?? 'unknown' }}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</template>
