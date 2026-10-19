<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Package, HeartHandshake, Bookmark, FileText, Plus, Globe
} from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { Card, CardContent } from '~/widgets/ui/card'
import { ProjectStatusEnum, type ProjectEntity } from '~/types/project'
import { useProjectsStore } from '~/stores/projectsStore'
import { useRequestsStore } from '~/stores/requestsStore'

const { user, ready } = useAuth()

// Projects Store
const projectsStore = useProjectsStore()
const { myProjects, loading: projectsLoading, error: projectsError } = storeToRefs(projectsStore)

// Requests Store (згідно з п. 11 ТЗ)[cite: 4]
const requestsStore = useRequestsStore()
const { incomingRequests, outgoingRequests } = storeToRefs(requestsStore)

const activeTab = ref<'created' | 'adopted' | 'requests' | 'favorites'>('created')

watch(
  () => user.value?.id,
  (id) => {
    if (id) {
      projectsStore.fetchMyProjects()
      requestsStore.fetchRequests?.() // Завантаження заявок через стор
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

const handleAccept = (id: string) => {
  requestsStore.acceptRequest?.(id)
}

const handleReject = (id: string) => {
  requestsStore.rejectRequest?.(id)
}

const handleWrite = (applicantId: string) => {
  console.log('Write to applicant:', applicantId)
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8">
    <!-- Session check still running -->
    <div v-if="!ready" class="py-24 text-center text-muted-foreground">
      Loading profile...
    </div>

    <!-- Not logged in -->
    <div
      v-else-if="!user"
      class="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
    >
      <h2 class="font-semibold text-lg text-foreground">You are not logged in</h2>
      <p class="text-sm text-muted-foreground">Log in with GitHub to see your profile.</p>
      <Button class="mt-2" @click="navigateTo('/login')">Log in</Button>
    </div>

    <template v-else>
      <!-- PROFILE HEADER -->
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
              </a>
              <span v-if="joinedDate" class="flex items-center gap-1">
                <Globe class="w-4 h-4" /> Joined {{ joinedDate }}
              </span>
            </div>
          </div>
        </div>

        <!-- STATS BAR -->
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

      <!-- TABS NAVIGATION -->
      <div class="flex items-center border-b border-border gap-2">
        <button :class="tabClass('created')" @click="activeTab = 'created'">
          <Package class="w-4 h-4" /> Created Projects
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ createdProjects.length }}
          </span>
        </button>

        <button :class="tabClass('adopted')" @click="activeTab = 'adopted'">
          <HeartHandshake class="w-4 h-4" /> Adopted Projects
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ adoptedProjects.length }}
          </span>
        </button>

        <button :class="tabClass('requests')" @click="activeTab = 'requests'">
          <FileText class="w-4 h-4" /> Requests
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ incomingRequests.length + outgoingRequests.length }}
          </span>
        </button>

        <button :class="tabClass('favorites')" @click="activeTab = 'favorites'">
          <Bookmark class="w-4 h-4" /> Favorites
          <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
            {{ favoriteProjects.length }}
          </span>
        </button>
      </div>

      <!-- TAB CONTENT -->
      <div class="min-h-[300px]">
        <!-- 1. CREATED PROJECTS -->
        <div v-if="activeTab === 'created'" class="flex flex-col gap-4">
          <p v-if="projectsError" class="text-sm text-destructive">{{ projectsError }}</p>
          <div v-if="projectsLoading && createdProjects.length === 0" class="py-16 text-center text-muted-foreground">
            Loading projects...
          </div>
          <div v-else-if="createdProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card v-for="project in createdProjects" :key="project.id" class="p-6 flex flex-col justify-between gap-4">
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold text-lg text-foreground">{{ project.title }}</h3>
                  <span class="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono">
                    {{ project.status }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground line-clamp-2">{{ project.description }}</p>
              </div>
              <div class="flex flex-wrap gap-1.5 pt-4 border-t border-border">
                <span v-for="tag in project.tags" :key="tag.id" class="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                  {{ tag.name }}
                </span>
              </div>
            </Card>
          </div>

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

        <!-- 2. ADOPTED PROJECTS -->
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

        <!-- 3. REQUESTS -->
        <div v-if="activeTab === 'requests'" class="flex flex-col gap-8">
          <!-- INCOMING REQUESTS -->
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

          <!-- OUTGOING REQUESTS -->
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

        <!-- 4. FAVORITES -->
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
