<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '~/widgets/ui/button'
import { Card, CardContent } from '~/widgets/ui/card'
import {
	ExternalLink,
	Folder,
	Clock,
	Tag,
	Sprout,
	HeartHandshake,
	Pencil,
} from '@lucide/vue'
import { useProjectsStore } from '~/stores/projectsStore'
import { useRequestsStore } from '~/stores/useRequestsStore'
import AdoptionModal from '~/components/modals/AdoptionModal.vue'
import { getProjectFullName, getProjectRepoUrl } from '~/lib/project'
import { ProjectStatusEnum } from '~/types/project'
import { ApplicationStatusEnum } from '~/types/application'

const projectsStore = useProjectsStore()
const requestsStore = useRequestsStore()
const submitting = ref(false)
const submitError = ref('')
const { user } = useAuth()
const route = useRoute()
const error = ref('')
const loading = ref(true)
const showAdoption = ref(false)
const project = computed(() => projectsStore.currentProject)

// Load my applications so the button can show whether I already applied
watch(
	() => user.value?.id,
	(id) => {
		if (id) requestsStore.fetchOutgoing()
	},
	{ immediate: true }
)

const isOwner = computed(
	() => !!user.value && project.value?.owner?.id === user.value.id
)

const myApplication = computed(() =>
	project.value ? requestsStore.activeForProject(project.value.id) : undefined
)

// What the Apply button shows for the current viewer
const applyState = computed(() => {
	if (!user.value)
		return { label: 'Log in to request adoption', canApply: true }
	if (isOwner.value) return { label: 'This is your project', canApply: false }
	if (project.value?.status !== ProjectStatusEnum.PUBLISHED) {
		return { label: 'Not open for requests', canApply: false }
	}
	if (myApplication.value) {
		const label =
			myApplication.value.status === ApplicationStatusEnum.ACCEPTED
				? 'Request accepted'
				: 'Request pending'
		return { label, canApply: false }
	}
	return { label: 'Request to adopt', canApply: true }
})

const onApplyClick = () => {
	if (!user.value) return navigateTo('/login')
	if (applyState.value.canApply) {
		submitError.value = ''
		showAdoption.value = true
	}
}

// The modal emits the raw form values. Map them to the backend DTO and send.
const onSubmitApplication = async (form: {
	whyMe: string
	actionPlan: string
	portfolioUrl: string
	acceptTerms: boolean
}) => {
	if (!project.value) return
	submitting.value = true
	submitError.value = ''
	try {
		await requestsStore.apply({
			projectId: project.value.id,
			whyMe: form.whyMe.trim(),
			plan: form.actionPlan.trim(),
			portfolioUrl: form.portfolioUrl.trim() || undefined,
		})
		showAdoption.value = false
	} catch (err) {
		submitError.value = requestsStore.error ?? 'Failed to send application'
	} finally {
		submitting.value = false
	}
}

const fullName = computed(() =>
	project.value ? getProjectFullName(project.value) : ''
)
const repoUrl = computed(() =>
	project.value ? getProjectRepoUrl(project.value) : '#'
)
const readinessPercent = computed(() =>
	Math.round((project.value?.readiness ?? 0) * 100)
)

const readinessLabel = computed(() => {
	const value = readinessPercent.value
	if (value >= 100) return 'Ready to take over'
	if (value >= 60) return 'Nearly there'
	if (value >= 25) return 'In progress'
	return 'Early stage'
})

const statusStyle = computed(() => {
	switch (project.value?.status) {
		case ProjectStatusEnum.PUBLISHED:
			return { dot: 'bg-emerald-500', label: 'Published' }
		case ProjectStatusEnum.TRANSFERRING:
			return { dot: 'bg-amber-400', label: 'Transferring' }
		case ProjectStatusEnum.ADOPTED:
			return { dot: 'bg-blue-500', label: 'Adopted' }
		case ProjectStatusEnum.DRAFT:
			return { dot: 'bg-gray-500', label: 'Draft' }
		default:
			return { dot: 'bg-emerald-500', label: project.value?.status ?? '' }
	}
})

const createdDate = computed(() => {
	if (!project.value?.createdAt) return ''
	return new Date(project.value.createdAt).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
})

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
	<LoadingSpinner v-if="loading" />

	<div
		v-else-if="error || !project"
		class="w-full flex flex-col items-center justify-center py-32 gap-4"
	>
		<p class="text-sm text-center text-destructive">
			{{ error || 'Project not found' }}
		</p>
		<NuxtLink to="/projects">
			<Button variant="outline">Back to catalog</Button>
		</NuxtLink>
	</div>

	<div
		v-else
		class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8"
	>
		<!-- HERO -->
		<section
			class="relative overflow-hidden bg-card border border-border rounded-2xl p-8 shadow-sm"
		>
			<div
				class="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
			/>

			<div
				class="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8"
			>
				<div class="flex flex-col gap-4 min-w-0">
					<div class="flex flex-wrap items-center gap-3">
						<span
							class="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-muted text-foreground"
						>
							<span :class="['w-2 h-2 rounded-full', statusStyle.dot]" />
							{{ statusStyle.label }}
						</span>
						<!--<span
							v-if="project.category"
							class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
						>
							<Folder class="w-3.5 h-3.5" />
							{{ project.category.name }}
						</span>-->
					</div>

					<h1
						class="text-4xl font-bold text-foreground tracking-tight break-words"
					>
						{{ project.title }}
					</h1>

					<p class="text-sm font-mono text-muted-foreground break-all">
						{{ fullName }}
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-3 shrink-0">
					<Button
						variant="outline"
						class="gap-2"
						:disabled="!applyState.canApply"
						@click="onApplyClick"
					>
						<HeartHandshake class="w-4 h-4" />
						{{ applyState.label }}
					</Button>
					<NuxtLink
						v-if="isOwner"
						:to="`/projects/${project.id}/edit`"
					>
						<Button
							variant="outline"
							class="gap-2"
						>
							<Pencil class="w-4 h-4" />
							Edit project
						</Button>
					</NuxtLink>
					<a
						:href="repoUrl"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button class="gap-2">
							<ExternalLink class="w-4 h-4" />
							Open repository
						</Button>
					</a>
				</div>
			</div>
		</section>

		<!-- BODY -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
			<!-- MAIN COLUMN -->
			<div class="lg:col-span-2 flex flex-col gap-6">
				<Card class="rounded-2xl p-0">
					<CardContent class="p-8 flex flex-col gap-4">
						<h2 class="text-lg font-semibold text-foreground">About</h2>
						<p
							class="text-muted-foreground leading-relaxed whitespace-pre-line"
						>
							{{ project.description }}
						</p>
					</CardContent>
				</Card>

				<Card class="rounded-2xl p-0">
					<CardContent class="p-8 flex flex-col gap-4">
						<h2
							class="flex items-center gap-2 text-lg font-semibold text-foreground"
						>
							<Tag class="w-4 h-4 text-muted-foreground" /> Tags
						</h2>
						<div
							v-if="project.tags?.length"
							class="flex flex-wrap gap-2"
						>
							<span
								v-for="tag in project.tags"
								:key="tag.id"
								class="px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground rounded-md border border-border"
							>
								#{{ tag.name }}
							</span>
						</div>
						<p
							v-else
							class="text-sm text-muted-foreground"
						>
							No tags yet.
						</p>
					</CardContent>
				</Card>
			</div>

			<!-- SIDEBAR -->
			<aside class="flex flex-col gap-6">
				<Card class="rounded-2xl p-0">
					<CardContent class="p-6 flex flex-col gap-5">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold text-foreground">Readiness</h2>
							<span class="text-xs font-medium text-muted-foreground">
								{{ readinessLabel }}
							</span>
						</div>

						<div class="flex items-end gap-2">
							<span class="text-5xl font-bold text-foreground tabular-nums">
								{{ readinessPercent }}
							</span>
							<span class="text-xl font-semibold text-muted-foreground pb-1"
								>%</span
							>
						</div>

						<div class="h-3 w-full rounded-full bg-muted overflow-hidden">
							<div
								class="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700"
								:style="{ width: `${readinessPercent}%` }"
							/>
						</div>
					</CardContent>
				</Card>

				<Card class="rounded-2xl p-0">
					<CardContent class="p-6 flex flex-col gap-4">
						<h2 class="text-lg font-semibold text-foreground">Details</h2>
						<dl class="flex flex-col gap-3 text-sm">
							<div class="flex items-center justify-between gap-4">
								<dt class="flex items-center gap-2 text-muted-foreground">
									<Sprout class="w-4 h-4" /> Status
								</dt>
								<dd class="font-medium text-foreground">
									{{ statusStyle.label }}
								</dd>
							</div>
							<div class="flex items-center justify-between gap-4">
								<dt class="flex items-center gap-2 text-muted-foreground">
									<Folder class="w-4 h-4" /> Category
								</dt>
								<dd class="font-medium text-foreground">
									{{ project.category?.name ?? '—' }}
								</dd>
							</div>
							<div class="flex items-center justify-between gap-4">
								<dt class="flex items-center gap-2 text-muted-foreground">
									<Clock class="w-4 h-4" /> Created
								</dt>
								<dd class="font-medium text-foreground">
									{{ createdDate || '—' }}
								</dd>
							</div>
						</dl>
					</CardContent>
				</Card>

				<Card class="rounded-2xl p-0">
					<CardContent class="p-6 flex flex-col gap-4">
						<h2 class="text-lg font-semibold text-foreground">Owner</h2>
						<div class="flex items-center gap-3 min-w-0">
							<img
								v-if="project.owner?.avatarUrl"
								:src="project.owner.avatarUrl"
								:alt="project.owner.login"
								class="w-12 h-12 rounded-full border border-border object-cover bg-secondary shrink-0"
							/>
							<div
								v-else
								class="w-12 h-12 rounded-full bg-secondary shrink-0"
							/>
							<div class="flex flex-col min-w-0">
								<span class="font-semibold text-foreground truncate">
									@{{ project.owner?.login ?? 'unknown' }}
								</span>
								<span
									v-if="project.owner?.bio"
									class="text-xs text-muted-foreground line-clamp-2"
								>
									{{ project.owner.bio }}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="rounded-2xl p-0">
					<CardContent class="p-6 flex flex-col gap-4">
						<h2 class="text-lg font-semibold text-foreground">Repository</h2>
						<p class="text-sm font-mono text-muted-foreground break-all">
							{{ fullName }}
						</p>
						<a
							:href="repoUrl"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								variant="outline"
								class="w-full gap-2"
							>
								<ExternalLink class="w-4 h-4" />
								View on GitHub
							</Button>
						</a>
					</CardContent>
				</Card>
			</aside>

			<AdoptionModal
				v-if="project"
				:is-open="showAdoption"
				:is-loading="submitting"
				:error="submitError"
				@close="showAdoption = false"
				@submit="onSubmitApplication"
			/>
		</div>
	</div>
</template>
