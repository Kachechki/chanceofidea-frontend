<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  User, Package, HeartHandshake, Bookmark, FileText, 
  Plus, ExternalLink, ShieldCheck, Globe, CheckCircle2, XCircle, Clock
} from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { Card, CardContent } from '~/widgets/ui/card'

// Активная вкладка: 'created' | 'adopted' | 'requests' | 'favorites'
const activeTab = ref<'created' | 'adopted' | 'requests' | 'favorites'>('created')

// Переключатель для тестирования пустого состояния нового юзера (можешь менять на true/false)
const isNewUserMock = ref(false)

// Мок-данные профиля
const userProfile = {
  name: 'Alex Developer',
  nickname: 'alexdev',
  avatar: 'https://github.com/identicons/alexdev.png',
  bio: 'Fullstack developer exploring open-source software, Nuxt, and system architecture. Looking to pass on my side projects.',
  github: 'https://github.com',
  twitter: 'https://twitter.com',
  site: 'https://alexdev.io',
  stats: {
    published: 3,
    transferred: 1,
    adopted: 2,
    reputationBadge: 'Core Contributor'
  }
}

// Мок-данные для созданных проектов
const createdProjects = [
  {
    id: '1',
    title: 'retro/walkman-firmware',
    description: 'Open-source custom firmware for digital portable cassette players and vintage audio gear restoration.',
    status: 'PUBLISHED',
    requestsCount: 2,
    tags: ['hardware', 'c', 'free']
  },
  {
    id: '2',
    title: 'logistics/factory-planner',
    description: 'Biometric calculator and throughput dependency graph visualizer for complex industrial factory simulation.',
    status: 'DRAFT',
    requestsCount: 0,
    tags: ['vue', 'simulation', 'algorithms']
  }
]

// Мок-данные для усиновленных проектов
const adoptedProjects = [
  {
    id: '3',
    title: 'db/postgres-shard-router',
    description: 'Transparent query routing proxy and automated horizontal sharding for distributed Postgres databases.',
    originalAuthor: 'sytnikov',
    adoptionDate: '12.09.2026',
    status: 'ADOPTED'
  }
]

// Мок-данные для заявок (Requests)
const requests = {
  incoming: [
    {
      id: 'req-1',
      projectTitle: 'retro/walkman-firmware',
      applicant: 'ivan_coder',
      whyMe: 'I have 5 years of experience in embedded C and love vintage audio gear restoration.',
      plan: '1. Audit current codebase (Week 1). 2. Fix motor control bugs (Week 2). 3. Release v1.1.',
      status: 'PENDING'
    }
  ],
  outgoing: [
    {
      id: 'req-2',
      projectTitle: 'ai-code-reviewer/bot',
      author: ' senior_dev',
      status: 'PENDING',
      submittedDate: '10.10.2026'
    }
  ]
}

// Мок-данные для закладок (Favorites)
const favorites = [
  {
    id: '4',
    title: 'browser/moodle-progress-sync',
    description: 'Chromium and Firefox extension that aggregates lesson completion metrics and semester grade points cleanly.',
    tags: ['frontend', 'extension', 'free']
  }
]

// Вычисляемые списки с учетом мока нового пользователя
const currentCreated = computed(() => isNewUserMock.value ? [] : createdProjects)
const currentAdopted = computed(() => isNewUserMock.value ? [] : adoptedProjects)
const currentIncoming = computed(() => isNewUserMock.value ? [] : requests.incoming)
const currentOutgoing = computed(() => isNewUserMock.value ? [] : requests.outgoing)
const currentFavorites = computed(() => isNewUserMock.value ? [] : favorites)
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8">
    
    <!-- DEV CONTROLS: Переключатель пустого состояния для проверки -->
    <div class="bg-muted/40 p-4 rounded-xl flex items-center justify-between border border-border">
      <span class="text-sm text-muted-foreground">
        🛠️ Dev Tool: Toggle Empty State (Testing New User Experience)
      </span>
      <Button 
        size="sm" 
        variant="outline" 
        @click="isNewUserMock = !isNewUserMock"
      >
        {{ isNewUserMock ? 'Show Populated Profile' : 'Show Empty Profile (New User)' }}
      </Button>
    </div>

    <!-- PROFILE HEADER -->
    <div class="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
      <div class="flex items-center gap-6">
        <img 
          :src="userProfile.avatar" 
          alt="Avatar" 
          class="w-24 h-24 rounded-full border-2 border-primary object-cover bg-secondary"
        />
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-foreground">{{ userProfile.name }}</h1>
            <span class="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">
              {{ userProfile.stats.reputationBadge }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground max-w-xl leading-relaxed">
            {{ userProfile.bio }}
          </p>
          <div class="flex items-center gap-4 text-sm text-muted-foreground pt-1">
            <a :href="userProfile.github" target="_blank" class="hover:text-foreground flex items-center gap-1">
              <Github class="w-4 h-4" /> @{{ userProfile.nickname }}
            </a>
            <a :href="userProfile.twitter" target="_blank" class="hover:text-foreground flex items-center gap-1">
              <Twitter class="w-4 h-4" /> Twitter
            </a>
            <a :href="userProfile.site" target="_blank" class="hover:text-foreground flex items-center gap-1">
              <Globe class="w-4 h-4" /> Website
            </a>
          </div>
        </div>
      </div>

      <!-- STATS BAR -->
      <div class="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border">
        <div class="text-center px-3">
          <div class="text-xl font-bold text-foreground">{{ userProfile.stats.published }}</div>
          <div class="text-xs text-muted-foreground">Published</div>
        </div>
        <div class="w-px h-8 bg-border" />
        <div class="text-center px-3">
          <div class="text-xl font-bold text-foreground">{{ userProfile.stats.transferred }}</div>
          <div class="text-xs text-muted-foreground">Transferred</div>
        </div>
        <div class="w-px h-8 bg-border" />
        <div class="text-center px-3">
          <div class="text-xl font-bold text-foreground">{{ userProfile.stats.adopted }}</div>
          <div class="text-xs text-muted-foreground">Adopted</div>
        </div>
      </div>
    </div>

    <!-- TABS NAVIGATION -->
    <div class="flex items-center border-b border-border gap-2">
      <button 
        @click="activeTab = 'created'"
        :class="['px-5 py-3 font-medium text-sm transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-2', 
          activeTab === 'created' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground']"
      >
        <Package class="w-4 h-4" /> Created Projects 
        <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
          {{ currentCreated.length }}
        </span>
      </button>

      <button 
        @click="activeTab = 'adopted'"
        :class="['px-5 py-3 font-medium text-sm transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-2', 
          activeTab === 'adopted' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground']"
      >
        <HeartHandshake class="w-4 h-4" /> Adopted Projects
        <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
          {{ currentAdopted.length }}
        </span>
      </button>

      <button 
        @click="activeTab = 'requests'"
        :class="['px-5 py-3 font-medium text-sm transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-2', 
          activeTab === 'requests' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground']"
      >
        <FileText class="w-4 h-4" /> Requests
        <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
          {{ currentIncoming.length + currentOutgoing.length }}
        </span>
      </button>

      <button 
        @click="activeTab = 'favorites'"
        :class="['px-5 py-3 font-medium text-sm transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-2', 
          activeTab === 'favorites' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground']"
      >
        <Bookmark class="w-4 h-4" /> Favorites
        <span class="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full text-foreground">
          {{ currentFavorites.length }}
        </span>
      </button>
    </div>

    <!-- TAB CONTENT -->
    <div class="min-h-[300px]">
      
      <!-- 1. CREATED PROJECTS TAB -->
      <div v-if="activeTab === 'created'" class="flex flex-col gap-4">
        <div v-if="currentCreated.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card v-for="project in currentCreated" :key="project.id" class="p-6 flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-lg text-foreground">{{ project.title }}</h3>
                <span class="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-mono">
                  {{ project.status }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground line-clamp-2">{{ project.description }}</p>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-border">
              <span class="text-xs text-muted-foreground">
                📥 Requests: <strong class="text-foreground">{{ project.requestsCount }}</strong>
              </span>
              <div class="flex items-center gap-2">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm" variant="default">Manage</Button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Empty State для Created Projects (Новый пользователь) -->
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

      <!-- 2. ADOPTED PROJECTS TAB -->
      <div v-if="activeTab === 'adopted'" class="flex flex-col gap-4">
        <div v-if="currentAdopted.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card v-for="project in currentAdopted" :key="project.id" class="p-6 flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-2">
              <h3 class="font-bold text-lg text-foreground">{{ project.title }}</h3>
              <p class="text-sm text-muted-foreground line-clamp-2">{{ project.description }}</p>
              <div class="text-xs text-muted-foreground mt-2">
                Original Author: <span class="text-foreground font-medium">@{{ project.originalAuthor }}</span> | Adopted on: {{ project.adoptionDate }}
              </div>
            </div>
            <div class="pt-4 border-t border-border flex justify-end">
              <Button size="sm" variant="outline">Open Repository</Button>
            </div>
          </Card>
        </div>

        <!-- Empty State для Adopted Projects -->
        <div v-else class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50">
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
      </div>

      <!-- 3. REQUESTS TAB -->
      <div v-if="activeTab === 'requests'" class="flex flex-col gap-6">
        <div>
          <h2 class="text-md font-semibold text-foreground mb-3">Incoming Requests ({{ currentIncoming.length }})</h2>
          <div v-if="currentIncoming.length > 0" class="flex flex-col gap-4">
            <Card v-for="req in currentIncoming" :key="req.id" class="p-6 flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-semibold text-primary uppercase tracking-wide">Project: {{ req.projectTitle }}</span>
                  <div class="text-sm font-bold text-foreground mt-0.5">Applicant: @{{ req.applicant }}</div>
                </div>
                <span class="px-2.5 py-1 text-xs bg-amber-500/10 text-amber-500 rounded font-medium">Pending Review</span>
              </div>
              <div class="bg-muted/40 p-3 rounded-lg text-sm flex flex-col gap-2">
                <div><strong>Why me:</strong> {{ req.whyMe }}</div>
                <div><strong>Action plan:</strong> {{ req.plan }}</div>
              </div>
              <div class="flex items-center justify-end gap-3 pt-2">
                <Button size="sm" variant="outline" class="text-destructive hover:bg-destructive/10">
                  <XCircle class="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button size="sm" class="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 class="w-4 h-4 mr-1" /> Accept & Start Transfer
                </Button>
              </div>
            </Card>
          </div>
          <div v-else class="text-sm text-muted-foreground bg-card/40 p-6 rounded-xl border border-border text-center">
            No incoming adoption requests at the moment.
          </div>
        </div>

        <div class="pt-4 border-t border-border">
          <h2 class="text-md font-semibold text-foreground mb-3">Outgoing Requests ({{ currentOutgoing.length }})</h2>
          <div v-if="currentOutgoing.length > 0" class="flex flex-col gap-4">
            <Card v-for="req in currentOutgoing" :key="req.id" class="p-5 flex items-center justify-between">
              <div>
                <div class="font-bold text-foreground">{{ req.projectTitle }}</div>
                <div class="text-xs text-muted-foreground">Author: @{{ req.author }} • Submitted: {{ req.submittedDate }}</div>
              </div>
              <span class="px-2.5 py-1 text-xs bg-amber-500/10 text-amber-500 rounded font-medium flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" /> Pending
              </span>
            </Card>
          </div>
          <div v-else class="text-sm text-muted-foreground bg-card/40 p-6 rounded-xl border border-border text-center">
            You haven't submitted any adoption requests yet.
          </div>
        </div>
      </div>

      <!-- 4. FAVORITES TAB -->
      <div v-if="activeTab === 'favorites'" class="flex flex-col gap-4">
        <div v-if="currentFavorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card v-for="project in currentFavorites" :key="project.id" class="p-6 flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-2">
              <h3 class="font-bold text-lg text-foreground">{{ project.title }}</h3>
              <p class="text-sm text-muted-foreground line-clamp-2">{{ project.description }}</p>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span v-for="tag in project.tags" :key="tag" class="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="pt-4 border-t border-border flex justify-end">
              <Button size="sm" variant="outline">View Details</Button>
            </div>
          </Card>
        </div>

        <!-- Empty State для Favorites -->
        <div v-else class="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-border rounded-2xl bg-card/50">
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

    </div>
  </div>
</template>