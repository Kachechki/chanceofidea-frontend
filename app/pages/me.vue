<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Package, HeartHandshake, Bookmark, FileText, Plus, Globe
} from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { ProjectStatusEnum, type ProjectEntity } from '~/types/project'
import { useProjectsStore } from '~/stores/projectsStore'
import { useRequestsStore } from '~/stores/useRequestsStore'
import { LIMITS, validateText } from '~/lib/validation'

const { user, ready } = useAuth()

useHead({ title: 'My Profile' })

const projectsStore = useProjectsStore()
const { myProjects, loading: projectsLoading, error: projectsError } = storeToRefs(projectsStore)

const requestsStore = useRequestsStore()
const { incomingRequests, outgoingRequests } = storeToRefs(requestsStore)

const activeTab = ref<'created' | 'adopted' | 'requests' | 'favorites'>('created')

watch(
  () => user.value?.id,
  (id) => {
    if (id) {
      projectsStore.fetchMyProjects()
      requestsStore.fetchRequests?.()
    }
  },
  { immediate: true }
)

const createdProjects = computed<ProjectEntity[]>(() => myProjects.value)
const adoptedProjects = computed<ProjectEntity[]>(() => [])
const favoriteProjects = computed<ProjectEntity[]>(() => [])

const publishedCount = computed(
  () => createdProjects.value.filter((p) => p.status === ProjectStatusEnum.PUBLISHED).length
)

const joinedDate = computed(() => {
  if (!user.value?.createdAt) return ''
  return new Date(user.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const tabClass = (tab: typeof activeTab.value) => [
  'px-5 py-3 font-medium text-sm transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-2',
  activeTab.value === tab
    ? 'border-primary text-primary font-semibold'
    : 'border-transparent text-muted-foreground hover:text-foreground',
]

// accepting starts the github transfer, so ask first
const handleAccept = async (id: string) => {
  if (!window.confirm('Accept this applicant? The repository will be transferred to them on GitHub.')) return
  try {
    await requestsStore.acceptRequest(id)
    // accepting changes the project status to TRANSFERRING
    projectsStore.fetchMyProjects()
  } catch {
    // the store keeps the message in `error`
  }
}

const handleReject = async (id: string) => {
  const input = window.prompt('Reason shown to the applicant:')
  if (input === null) return

  const reason = input.trim()
  const reasonError = validateText(reason, 'Reason', LIMITS.rejectReason)
  if (reasonError) {
    requestsStore.error = reasonError
    return
  }

  try {
    await requestsStore.rejectRequest(id, reason)
  } catch {
    // the store keeps the message in `error`
  }
}

const handleWrite = (applicantId: string) => {
  console.log('Write to applicant:', applicantId)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8">
    <LoadingSpinner v-if="!ready" />


    <div
      v-else-if="!user"
      class="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
    >
      <h2 class="font-semibold text-lg text-foreground">You are not logged in</h2>
      <p class="text-sm text-muted-foreground">Log in with GitHub to see your profile.</p>
      <Button as-child class="mt-2">
        <NuxtLink to="/login">Log in</NuxtLink>
      </Button>
    </div>

    <template v-else>
      <div class="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div class="flex items-center gap-6">
          <img
            :src="user.avatarUrl"
            :alt="user.login"
            class="w-24 h-24 rounded-full border-2 border-primary object-cover bg-secondary"
          />
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-foreground">@{{ user.login }}</h1>
            </div>
            <p v-if="user.bio" class="text-sm text-muted-foreground max-w-xl leading-relaxed">
              {{ user.bio }}
            </p>
            <div class="flex items-center gap-4 text-sm text-muted-foreground pt-1">
              <a
                :href="`https://github.com/${user.login}`"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-foreground flex items-center gap-1"
              >
                GitHub profile
                <span class="sr-only">(opens in a new tab)</span>
              </a>
              <span v-if="joinedDate" class="flex items-center gap-1">
                <Globe class="w-4 h-4" /> Joined {{ joinedDate }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border">
          <div class="text-center px-3">
            <div class="text-xl font-bold text-foreground">{{ publishedCount }}</div>
            <div class="text-xs text-muted-foreground">Published</div>
          </div>
          <div class="w-px h-8 bg-border" />
          <div class="text-center px-3">
            <div class="text-xl font-bold text-foreground">{{ createdProjects.length }}</div>
            <div class="text-xs text-muted-foreground">Created</div>
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="Profile sections" class="flex items-center border-b border-border gap-2">
        <button
          id="tab-created"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'created'"
          aria-controls="profile-panel"
          :tabindex="activeTab === 'created' ? 0 : -1"
          :class="tabClass('created')"
          @click="activeTab = 'created'"
        >
          <Package class="w-4 h-4" aria-hidden="true" /> Created Projects
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ createdProjects.length }}
          </span>
        </button>

        <button
          id="tab-adopted"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'adopted'"
          aria-controls="profile-panel"
          :tabindex="activeTab === 'adopted' ? 0 : -1"
          :class="tabClass('adopted')"
          @click="activeTab = 'adopted'"
        >
          <HeartHandshake class="w-4 h-4" aria-hidden="true" /> Adopted Projects
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ adoptedProjects.length }}
          </span>
        </button>

        <button
          id="tab-requests"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'requests'"
          aria-controls="profile-panel"
          :tabindex="activeTab === 'requests' ? 0 : -1"
          :class="tabClass('requests')"
          @click="activeTab = 'requests'"
        >
          <FileText class="w-4 h-4" aria-hidden="true" /> Requests
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ incomingRequests.length + outgoingRequests.length }}
          </span>
        </button>

        <button
          id="tab-favorites"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'favorites'"
          aria-controls="profile-panel"
          :tabindex="activeTab === 'favorites' ? 0 : -1"
          :class="tabClass('favorites')"
          @click="activeTab = 'favorites'"
        >
          <Bookmark class="w-4 h-4" aria-hidden="true" /> Favorites
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ favoriteProjects.length }}
          </span>
        </button>
      </div>

      <div
        id="profile-panel"
        role="tabpanel"
        :aria-labelledby="`tab-${activeTab}`"
        class="min-h-[300px]"
      >
        <div v-if="activeTab === 'created'" class="flex flex-col gap-4">
          <p v-if="projectsError" class="text-sm text-destructive">{{ projectsError }}</p>
          <LoadingSpinner v-if="projectsLoading && createdProjects.length === 0" />
          <ul v-else-if="createdProjects.length > 0" aria-label="Created projects" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <li v-for="project in createdProjects" :key="project.id">
              <ProjectCard :project="project" />
            </li>
          </ul>

          <div v-else class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Package class="w-6 h-6" />
            </div>
            <div class="text-center">
              <h3 class="font-semibold text-lg text-foreground">No projects created yet</h3>
              <p class="text-sm text-muted-foreground max-w-sm mt-1">
                You haven't published any side projects. Share your unfinished work with developers who will finish it.
              </p>
            </div>
            <NuxtLink to="/projects/create">
              <Button class="mt-2 flex items-center gap-2">
                <Plus class="w-4 h-4" /> Publish your first project
              </Button>
            </NuxtLink>
          </div>
        </div>

        <div v-if="activeTab === 'adopted'" class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <HeartHandshake class="w-6 h-6" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-lg text-foreground">No adopted projects</h3>
            <p class="text-sm text-muted-foreground max-w-sm mt-1">
              You haven't adopted any projects yet. Browse the catalog to find exciting codebases to continue.
            </p>
          </div>
          <NuxtLink to="/projects">
            <Button class="mt-2" variant="outline">Find a project</Button>
          </NuxtLink>
        </div>

        <div v-if="activeTab === 'requests'" class="flex flex-col gap-8">
          <p v-if="requestsStore.error" class="text-sm text-destructive">{{ requestsStore.error }}</p>

          <div class="flex flex-col gap-4">
            <h2 class="text-md font-semibold text-foreground flex items-center gap-2">
              Incoming Requests
              <span class="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {{ incomingRequests.length }}
              </span>
            </h2>

            <div v-if="incomingRequests.length > 0" class="flex flex-col gap-4">
              <RequestCard
                v-for="req in incomingRequests"
                :key="req.id"
                :request="req"
                :is-author-view="true"
                @accept="handleAccept"
                @reject="handleReject"
                @write="handleWrite"
              />
            </div>

            <div v-else class="text-sm text-muted-foreground bg-card/40 p-6 rounded-xl border border-border text-center">
              No incoming adoption requests at the moment.
            </div>
          </div>

          <div class="flex flex-col gap-4 pt-4 border-t border-border">
            <h2 class="text-md font-semibold text-foreground flex items-center gap-2">
              Outgoing Requests
              <span class="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {{ outgoingRequests.length }}
              </span>
            </h2>

            <div v-if="outgoingRequests.length > 0" class="flex flex-col gap-4">
              <RequestCard
                v-for="req in outgoingRequests"
                :key="req.id"
                :request="req"
                :is-author-view="false"
              />
            </div>

            <div v-else class="text-sm text-muted-foreground bg-card/40 p-6 rounded-xl border border-border text-center">
              You haven't submitted any adoption requests yet.
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'favorites'" class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bookmark class="w-6 h-6" />
          </div>
          <div class="text-center">
            <h3 class="font-semibold text-lg text-foreground">No bookmarked projects</h3>
            <p class="text-sm text-muted-foreground max-w-sm mt-1">
              Save interesting projects while browsing the catalog to review them later.
            </p>
          </div>
          <NuxtLink to="/projects">
            <Button class="mt-2" variant="outline">Explore catalog</Button>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
