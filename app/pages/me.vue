<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
	Package,
	HeartHandshake,
	Bookmark,
	FileText,
	Plus,
	Globe,
	Clock,
} from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { ProjectStatusEnum, type ProjectEntity } from '~/types/project'
import { useProjectsStore } from '~/stores/projectsStore'
import { useRequestsStore } from '~/stores/useRequestsStore'
import { useBookmarksStore } from '~/stores/bookmarksStore'
import type { ApplicationEntity } from '~/types/application'
import { useRoute, useRouter } from 'vue-router'
import AcceptTransferModal from '~/components/modals/AcceptTransferModal.vue'
import TransferActionModal from '~/components/modals/TransferActionModal.vue'
import RejectApplicationModal from '~/components/modals/RejectApplicationModal.vue'

const { user, ready } = useAuth()
const githubAppSlug = useRuntimeConfig().public.githubAppSlug as string
const { t, locale } = useI18n()

useHead({ title: computed(() => t('profile.title')) })

const projectsStore = useProjectsStore()
const {
	myProjects,
	loading: projectsLoading,
	error: projectsError,
} = storeToRefs(projectsStore)

const requestsStore = useRequestsStore()
const { incomingRequests, outgoingRequests, applicantTransfers } =
	storeToRefs(requestsStore)

type ProfileTab = 'created' | 'bookmarks' | 'requests' | 'transfers' | 'adopted'
const profileTabs: ProfileTab[] = ['created', 'bookmarks', 'requests', 'transfers', 'adopted']
const route = useRoute()
const router = useRouter()

// unknown or missing ?tab= falls back to created projects
const tabFromQuery = (value: unknown): ProfileTab => {
	const tab = Array.isArray(value) ? value[0] : value
	return profileTabs.find((t) => t === tab) ?? 'created'
}

const activeTab = ref<ProfileTab>(tabFromQuery(route.query.tab))

// write the default into the URL when ?tab= is missing or unknown
onMounted(() => {
	if (route.query.tab !== activeTab.value)
		router.replace({ query: { ...route.query, tab: activeTab.value } })
})

// keep the tab in the URL so reloads, back/forward, and links land on the same tab
watch(activeTab, (tab) => {
	if (route.query.tab === tab) return
	router.replace({ query: { ...route.query, tab } })
})

// follow the URL when it changes, for example from a link or the back button
watch(
	() => route.query.tab,
	(tab) => {
		activeTab.value = tabFromQuery(tab)
	},
)

watch(
	() => user.value?.id,
	(id) => {
		if (id) {
			projectsStore.fetchMyProjects()
			requestsStore.fetchRequests?.()
		}
	},
	{ immediate: true },
)

// adopted projects leave the created list and show in the adopted tab
const createdProjects = computed<ProjectEntity[]>(() =>
	myProjects.value.filter((p) => p.status !== ProjectStatusEnum.ADOPTED),
)
const adoptedProjects = computed<ProjectEntity[]>(() =>
	myProjects.value.filter((p) => p.status === ProjectStatusEnum.ADOPTED),
)
const bookmarks = useBookmarksStore()
const bookmarkedProjects = computed<ProjectEntity[]>(() => bookmarks.items)

// tab order: created, bookmarks, requests, transfers, adopted
const tabs = computed(() => [
	{
		id: 'created' as const,
		label: t('profile.tabs.created'),
		icon: Package,
		count: createdProjects.value.length,
	},
	{
		id: 'bookmarks' as const,
		label: t('profile.tabs.bookmarks'),
		icon: Bookmark,
		count: bookmarkedProjects.value.length,
	},
	{
		id: 'requests' as const,
		label: t('profile.tabs.requests'),
		icon: FileText,
		count: incomingRequests.value.length + outgoingRequests.value.length,
	},
	{
		id: 'transfers' as const,
		label: t('profile.tabs.transfers'),
		icon: Clock,
		count: applicantTransfers.value.length,
	},
	{
		id: 'adopted' as const,
		label: t('profile.tabs.adopted'),
		icon: HeartHandshake,
		count: adoptedProjects.value.length,
	},
])

const publishedCount = computed(
	() =>
		createdProjects.value.filter(
			(p) => p.status === ProjectStatusEnum.PUBLISHED,
		).length,
)

const joinedDate = computed(() => {
	if (!user.value?.createdAt) return ''
	return new Date(user.value.createdAt).toLocaleDateString(locale.value === 'uk' ? 'uk-UA' : 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
})

const tabClass = (tab: typeof activeTab.value) => [
	'px-3 md:px-5 py-3 whitespace-nowrap shrink-0 font-medium text-sm transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-2',
	activeTab.value === tab
		? 'border-primary text-primary font-semibold'
		: 'border-transparent text-muted-foreground hover:text-foreground',
]

// the accept confirmation dialog, opened with the application being accepted
const acceptTarget = ref<ApplicationEntity | null>(null)
const acceptSubmitting = ref(false)
const acceptError = ref('')

const openAccept = (id: string) => {
	const application = requestsStore.incoming.find((a) => a.id === id)
	if (!application) return
	acceptError.value = ''
	acceptTarget.value = application
}

const closeAccept = () => {
	if (acceptSubmitting.value) return
	acceptTarget.value = null
}

const confirmAccept = async () => {
	if (!acceptTarget.value) return
	acceptSubmitting.value = true
	acceptError.value = ''
	try {
		await requestsStore.acceptRequest(acceptTarget.value.id)
		acceptTarget.value = null
		// accepting changes the project status to TRANSFERRING
		projectsStore.fetchMyProjects()
	} catch (err) {
		acceptError.value = requestsStore.error ?? t('errors.acceptApplication')
	} finally {
		acceptSubmitting.value = false
	}
}

// the applicant's transfer actions: confirm receipt or decline. one dialog for both.
const transferTarget = ref<ApplicationEntity | null>(null)
const transferMode = ref<'confirm' | 'decline'>('confirm')
const transferSubmitting = ref(false)
const transferError = ref('')

const openTransfer = (
	application: ApplicationEntity,
	mode: 'confirm' | 'decline',
) => {
	transferError.value = ''
	transferMode.value = mode
	transferTarget.value = application
}

const closeTransfer = () => {
	if (transferSubmitting.value) return
	transferTarget.value = null
}

const confirmTransfer = async () => {
	transferSubmitting.value = true
	transferError.value = ''
	try {
		const applicationId = transferTarget.value?.id ?? ''
		if (transferMode.value === 'confirm')
			await requestsStore.confirmReceived(applicationId)
		else await requestsStore.declineTransfer(applicationId)
		transferTarget.value = null
		// a confirmed transfer changes the project to adopted, so refresh the project lists
		projectsStore.fetchMyProjects()
	} catch {
		transferError.value = requestsStore.error ?? t('errors.completeAction')
	} finally {
		transferSubmitting.value = false
	}
}

// the reject dialog, opened with the application being rejected
const rejectTarget = ref<ApplicationEntity | null>(null)
const rejectSubmitting = ref(false)
const rejectError = ref('')

const openReject = (id: string) => {
	const application = requestsStore.incoming.find((a) => a.id === id)
	if (!application) return
	rejectError.value = ''
	rejectTarget.value = application
}

const closeReject = () => {
	if (rejectSubmitting.value) return
	rejectTarget.value = null
}

const confirmReject = async (reason: string) => {
	if (!rejectTarget.value) return
	rejectSubmitting.value = true
	rejectError.value = ''
	try {
		await requestsStore.rejectRequest(rejectTarget.value.id, reason)
		rejectTarget.value = null
	} catch {
		rejectError.value = requestsStore.error ?? t('errors.rejectApplication')
	} finally {
		rejectSubmitting.value = false
	}
}
</script>

<template>
	<div class="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
		<LoadingSpinner v-if="!ready" />

		<div
			v-else-if="!user"
			class="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
		>
			<h2 class="font-semibold text-lg text-foreground">
				{{ $t('profile.loggedOutTitle') }}
			</h2>
			<p class="text-sm text-muted-foreground">
				{{ $t('profile.loggedOutBody') }}
			</p>
			<Button
				as-child
				class="mt-2"
			>
				<NuxtLink to="/login">{{ $t('common.login') }}</NuxtLink>
			</Button>
		</div>

		<template v-else>
			<div
				class="bg-card border border-border rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
			>
				<div class="flex items-center gap-6">
					<img
						:src="user.avatarUrl"
						:alt="user.login"
						class="w-24 h-24 rounded-full border-2 border-primary object-cover bg-secondary"
					/>
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-3">
							<h1 class="text-2xl font-bold text-foreground">
								@{{ user.login }}
							</h1>
						</div>
						<p
							v-if="user.bio"
							class="text-sm text-muted-foreground max-w-xl leading-relaxed"
						>
							{{ user.bio }}
						</p>
						<div
							class="flex items-center gap-4 text-sm text-muted-foreground pt-1"
						>
							<a
								:href="`https://github.com/${user.login}`"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-foreground flex items-center gap-1"
							>
								{{ $t('profile.githubProfile') }}
								<span class="sr-only">{{ $t('common.newTab') }}</span>
							</a>
							<span
								v-if="joinedDate"
								class="flex items-center gap-1"
							>
								<Globe class="w-4 h-4" /> {{ $t('profile.joined', { date: joinedDate }) }}
							</span>
						</div>
					</div>
				</div>

				<div
					class="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border"
				>
					<Button
						v-if="githubAppSlug"
						as-child
						class="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<a
							:href="`https://github.com/apps/${githubAppSlug}/installations/new`"
							target="_blank"
							rel="noopener noreferrer"
						>
							{{ $t('profile.installApp') }}
							<span class="sr-only">{{ $t('common.newTabGithub') }}</span>
						</a>
					</Button>
					<div class="text-center px-3">
						<div class="text-xl font-bold text-foreground">
							{{ publishedCount }}
						</div>
						<div class="text-xs text-muted-foreground">{{ $t('profile.published') }}</div>
					</div>
					<div class="w-px h-8 bg-border" />
					<div class="text-center px-3">
						<div class="text-xl font-bold text-foreground">
							{{ createdProjects.length }}
						</div>
						<div class="text-xs text-muted-foreground">{{ $t('profile.created') }}</div>
					</div>
				</div>
			</div>

			<div
				role="tablist"
				:aria-label="$t('profile.sections')"
				class="flex items-center border-b border-border gap-2 overflow-x-auto"
			>
				<button
					v-for="tab in tabs"
					:id="`tab-${tab.id}`"
					:key="tab.id"
					type="button"
					role="tab"
					:aria-selected="activeTab === tab.id"
					aria-controls="profile-panel"
					:tabindex="activeTab === tab.id ? 0 : -1"
					:class="tabClass(tab.id)"
					@click="activeTab = tab.id"
				>
					<component
						:is="tab.icon"
						class="w-4 h-4"
						aria-hidden="true"
					/>
					{{ tab.label }}
					<span
						class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground"
					>
						{{ tab.count }}
					</span>
				</button>
			</div>

			<div
				id="profile-panel"
				role="tabpanel"
				:aria-labelledby="`tab-${activeTab}`"
				class="min-h-[300px]"
			>
				<div
					v-if="activeTab === 'created'"
					class="flex flex-col gap-4"
				>
					<p
						v-if="projectsError"
						class="text-sm text-destructive"
					>
						{{ projectsError }}
					</p>
					<LoadingSpinner
						v-if="projectsLoading && createdProjects.length === 0"
					/>
					<ul
						v-else-if="createdProjects.length > 0"
						:aria-label="$t('profile.createdList')"
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						<li
							v-for="project in createdProjects"
							:key="project.id"
						>
							<ProjectCard :project="project" />
						</li>
					</ul>

					<div
						v-else
						class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
					>
						<div
							class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
						>
							<Package class="w-6 h-6" />
						</div>
						<div class="text-center">
							<h3 class="font-semibold text-lg text-foreground">
								{{ $t('profile.emptyCreatedTitle') }}
							</h3>
							<p class="text-sm text-muted-foreground max-w-sm mt-1">
								{{ $t('profile.emptyCreatedBody') }}
							</p>
						</div>
						<Button
							as-child
							class="mt-2 flex items-center gap-2"
						>
							<NuxtLink to="/projects/create">
								<Plus class="w-4 h-4" /> {{ $t('profile.publishFirst') }}
							</NuxtLink>
						</Button>
					</div>
				</div>

				<div
					v-if="activeTab === 'adopted'"
					class="flex flex-col gap-4"
				>
					<ul
						v-if="adoptedProjects.length > 0"
						:aria-label="$t('profile.adoptedList')"
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						<li
							v-for="project in adoptedProjects"
							:key="project.id"
						>
							<ProjectCard :project="project" />
						</li>
					</ul>

					<div
						v-else
						class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
					>
						<div
							class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
						>
							<HeartHandshake class="w-6 h-6" />
						</div>
						<div class="text-center">
							<h3 class="font-semibold text-lg text-foreground">
								{{ $t('profile.emptyAdoptedTitle') }}
							</h3>
							<p class="text-sm text-muted-foreground max-w-sm mt-1">
								{{ $t('profile.emptyAdoptedBody') }}
							</p>
						</div>
						<Button
							as-child
							class="mt-2"
							variant="outline"
						>
							<NuxtLink to="/projects">{{ $t('profile.findProject') }}</NuxtLink>
						</Button>
					</div>
				</div>

				<div
					v-if="activeTab === 'requests'"
					class="flex flex-col gap-8"
				>
					<p
						v-if="requestsStore.error"
						class="text-sm text-destructive"
					>
						{{ requestsStore.error }}
					</p>

					<div class="flex flex-col gap-4">
						<h2
							class="text-md font-semibold text-foreground flex items-center gap-2"
						>
							{{ $t('profile.incoming') }}
							<span
								class="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
							>
								{{ incomingRequests.length }}
							</span>
						</h2>

						<div
							v-if="incomingRequests.length > 0"
							class="flex flex-col gap-4"
						>
							<RequestCard
								v-for="req in incomingRequests"
								:key="req.id"
								:request="req"
								:is-author-view="true"
								@accept="openAccept"
								@reject="openReject"
							/>
						</div>

						<div
							v-else
							class="text-sm text-muted-foreground bg-card/40 p-6 rounded-xl border border-border text-center"
						>
							{{ $t('profile.noIncoming') }}
						</div>
					</div>

					<div class="flex flex-col gap-4 pt-4 border-t border-border">
						<h2
							class="text-md font-semibold text-foreground flex items-center gap-2"
						>
							{{ $t('profile.outgoing') }}
							<span
								class="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
							>
								{{ outgoingRequests.length }}
							</span>
						</h2>

						<div
							v-if="outgoingRequests.length > 0"
							class="flex flex-col gap-4"
						>
							<RequestCard
								v-for="req in outgoingRequests"
								:key="req.id"
								:request="req"
								:is-author-view="false"
							/>
						</div>

						<div
							v-else
							class="text-sm text-muted-foreground bg-card/40 p-6 rounded-xl border border-border text-center"
						>
							{{ $t('profile.noOutgoing') }}
						</div>
					</div>
				</div>

				<div
					v-if="activeTab === 'transfers'"
					class="flex flex-col gap-4"
				>
					<ul
						v-if="applicantTransfers.length > 0"
						:aria-label="$t('profile.transfersList')"
						class="grid grid-cols-1 md:grid-cols-2 gap-6"
					>
						<li
							v-for="application in applicantTransfers"
							:key="application.id"
						>
							<TransferCard
								:application="application"
								@confirm="openTransfer(application, 'confirm')"
								@decline="openTransfer(application, 'decline')"
							/>
						</li>
					</ul>
					<div
						v-else
						class="flex flex-col items-center justify-center py-16 gap-2 border border-dashed border-border rounded-2xl bg-card/50 text-center"
					>
						<h3 class="font-semibold text-lg text-foreground">
							{{ $t('profile.noTransfersTitle') }}
						</h3>
						<p class="text-sm text-muted-foreground max-w-sm">
							{{ $t('profile.noTransfersBody') }}
						</p>
					</div>
				</div>

				<div
					v-if="activeTab === 'bookmarks'"
					class="flex flex-col gap-4"
				>
					<ul
						v-if="bookmarkedProjects.length > 0"
						:aria-label="$t('profile.bookmarksList')"
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						<li
							v-for="project in bookmarkedProjects"
							:key="project.id"
						>
							<ProjectCard :project="project" />
						</li>
					</ul>

					<div
						v-else
						class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
					>
						<div
							class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
						>
							<Bookmark
								class="w-6 h-6"
								aria-hidden="true"
							/>
						</div>
						<div class="text-center">
							<h3 class="font-semibold text-lg text-foreground">
								{{ $t('profile.emptyBookmarksTitle') }}
							</h3>
							<p class="text-sm text-muted-foreground max-w-sm mt-1">
								{{ $t('profile.emptyBookmarksBody') }}
							</p>
						</div>
						<Button
							as-child
							class="mt-2"
							variant="outline"
						>
							<NuxtLink to="/projects">{{ $t('profile.explore') }}</NuxtLink>
						</Button>
					</div>
				</div>
			</div>
		</template>

		<AcceptTransferModal
			v-if="acceptTarget"
			:is-open="!!acceptTarget"
			:repo-name="acceptTarget.project?.repositoryName ?? ''"
			:applicant-login="acceptTarget.applicant?.login ?? ''"
			:is-loading="acceptSubmitting"
			:error="acceptError"
			@close="closeAccept"
			@confirm="confirmAccept"
		/>

		<TransferActionModal
			:is-open="!!transferTarget"
			:mode="transferMode"
			:owner-login="transferTarget?.project?.owner?.login ?? ''"
			:repo-name="transferTarget?.project?.repositoryName ?? ''"
			:is-loading="transferSubmitting"
			:error="transferError"
			@close="closeTransfer"
			@confirm="confirmTransfer"
		/>

		<RejectApplicationModal
			:is-open="!!rejectTarget"
			:applicant-login="rejectTarget?.applicant?.login ?? ''"
			:project-title="rejectTarget?.project?.title ?? ''"
			:is-loading="rejectSubmitting"
			:error="rejectError"
			@close="closeReject"
			@confirm="confirmReject"
		/>
	</div>
</template>
