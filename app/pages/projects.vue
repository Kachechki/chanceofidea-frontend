<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, RotateCcw, Package, Tag } from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { ProjectStatusEnum, type ProjectEntity } from '~/types/project'

const route = useRoute()
const router = useRouter()

const searchQuery = ref((route.query.q as string) || '')
const selectedTag = ref((route.query.tag as string) || 'all')
const selectedSort = ref((route.query.sort as string) || 'newest')

const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'tg bot', label: 'TG Bot' },
  { id: 'rust', label: 'Rust' },
  { id: 'go', label: 'Go' },
  { id: 'vue.js', label: 'Vue.js' },
  { id: 'node.js', label: 'Node.js' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'react', label: 'React' },
  { id: 'docker', label: 'Docker' },
  { id: 'ai', label: 'AI' },
  { id: 'c', label: 'C' },
  { id: 'other', label: 'Other' },
]

const projects = ref<ProjectEntity[]>([
    {
        id: 'uuid-proj-001',
        title: 'ai-code-reviewer/bot',
        status: ProjectStatusEnum.PUBLISHED,
        readiness: 0.85,
        description: 'An automated GitHub bot that performs deep AST parsing and AI-assisted security reviews on pull requests.',
        repositoryId: 1049281,
        repostoryUrl: 'https://github.com/ai-code-reviewer/bot',
        createdAt: new Date('2026-01-15T10:00:00Z'),
        owner: {} as any,
        category: { id: 'cat-1', name: 'AI/ML' } as any,
        tags: [{ id: 'tag-1', name: 'ai', slug: 'ai' }, { id: 'tag-2', name: 'backend', slug: 'backend' }, { id: 'tag-3', name: 'python', slug: 'python' }],
    },
    {
        id: 'uuid-proj-002',
        title: 'nuxt/seo-toolkit',
        status: ProjectStatusEnum.TRANSFERRING,
        readiness: 0.6,
        description: 'Lightweight meta tag and OpenGraph inspector plugin built explicitly for Nuxt 4 architecture.',
        repositoryId: 2938471,
        repostoryUrl: 'https://github.com/nuxt-contrib/seo-toolkit',
        createdAt: new Date('2026-02-10T14:30:00Z'),
        owner: {} as any,
        category: { id: 'cat-2', name: 'Open Source Tool' } as any,
        tags: [{ id: 'tag-5', name: 'vue.js', slug: 'vue.js' }, { id: 'tag-6', name: 'frontend', slug: 'frontend' }, { id: 'tag-7', name: 'typescript', slug: 'typescript' }],
    },
    {
        id: 'uuid-proj-003',
        title: 'cyber/packet-sniffer',
        status: ProjectStatusEnum.ADOPTED,
        readiness: 0.95,
        description: 'Real-time network traffic analyzer and anomalous packet logger written with high-performance C bindings.',
        repositoryId: 3849102,
        repostoryUrl: 'https://github.com/cyber/packet-sniffer',
        createdAt: new Date('2025-11-05T09:15:00Z'),
        owner: {} as any,
        category: { id: 'cat-3', name: 'Open Source Tool' } as any,
        tags: [{ id: 'tag-8', name: 'cybersecurity', slug: 'cybersecurity' }, { id: 'tag-9', name: 'c', slug: 'c' }, { id: 'tag-10', name: 'backend', slug: 'backend' }],
    },
    {
        id: 'uuid-proj-004',
        title: 'retro/walkman-firmware',
        status: ProjectStatusEnum.PUBLISHED,
        readiness: 0.4,
        description: 'Open-source custom firmware patch for digital portable cassette players and vintage audio gear restoration.',
        repositoryId: 4958201,
        repostoryUrl: 'https://github.com/retro/walkman-firmware',
        createdAt: new Date('2026-03-01T18:45:00Z'),
        owner: {} as any,
        category: { id: 'cat-4', name: 'Hardware/IoT' } as any,
        tags: [{ id: 'tag-11', name: 'rust', slug: 'rust' }, { id: 'tag-12', name: 'hardware', slug: 'hardware' }],
    },
    {
        id: 'uuid-proj-005',
        title: 'logistics/factory-planner',
        status: ProjectStatusEnum.TRANSFERRING,
        readiness: 0.7,
        description: 'Isometric calculator and throughput dependency graph visualizer for complex industrial factory simulation games.',
        repositoryId: 5019283,
        repostoryUrl: 'https://github.com/logistics/factory-planner',
        createdAt: new Date('2026-03-20T11:20:00Z'),
        owner: {} as any,
        category: { id: 'cat-5', name: 'GameDev' } as any,
        tags: [{ id: 'tag-13', name: 'java', slug: 'java' }, { id: 'tag-14', name: 'other', slug: 'other' }],
    },
    {
        id: 'uuid-proj-006',
        title: 'db/postgres-shard-router',
        status: ProjectStatusEnum.PUBLISHED,
        readiness: 0.8,
        description: 'Transparent query routing proxy and automated horizontal sharding manager for distributed PostgreSQL clusters.',
        repositoryId: 6102938,
        repostoryUrl: 'https://github.com/db/postgres-shard-router',
        createdAt: new Date('2026-01-28T16:00:00Z'),
        owner: {} as any,
        category: { id: 'cat-6', name: 'SaaS' } as any,
        tags: [{ id: 'tag-15', name: 'go', slug: 'go' }, { id: 'tag-16', name: 'backend', slug: 'backend' }, { id: 'tag-17', name: 'docker', slug: 'docker' }],
    },
])

let searchTimeout: NodeJS.Timeout
watch([searchQuery, selectedTag, selectedSort], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    router.replace({
      query: {
        q: searchQuery.value || undefined,
        tag: selectedTag.value !== 'all' ? selectedTag.value : undefined,
        sort: selectedSort.value !== 'newest' ? selectedSort.value : undefined,
      }
    })
  }, 300)
})

const filteredProjects = computed(() => {
  let result = projects.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    )
  }

  if (selectedTag.value !== 'all') {
    result = result.filter(p => p.tags?.some(t => t.slug === selectedTag.value || t.name.toLowerCase() === selectedTag.value))
  }

  if (selectedSort.value === 'readiness') {
    result = [...result].sort((a, b) => (b.readiness || 0) - (a.readiness || 0))
  } else if (selectedSort.value === 'newest') {
    result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (selectedSort.value === 'most applications') {
    result = [...result].sort((a, b) => (b.repositoryId || 0) - (a.repositoryId || 0))
  }

  return result
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedTag.value = 'all'
  selectedSort.value = 'newest'
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold text-foreground">Project Catalog</h1>
      <p class="text-muted-foreground text-sm">
        Explore open-source abandoned projects, find your next codebase, and adopt it.
      </p>
    </div>

    <div class="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
      <div class="relative w-full md:w-96">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search projects by title or description..."
          class="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <select 
          v-model="selectedSort"
          class="px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none"
        >
          <option value="newest">Sort: Newest</option>
          <option value="readiness">Sort: Readiness</option>
          <option value="most applications">Sort: Most Applications</option>
        </select>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Tag class="w-3.5 h-3.5" /> Categories:
        </span>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectedTag = cat.id"
          :class="['px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer border',
            selectedTag === cat.id 
              ? 'bg-accent text-accent-foreground border-primary font-semibold' 
              : 'bg-background text-muted-foreground border-border hover:border-muted-foreground'
          ]"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="min-h-[400px]">
      <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard 
          v-for="project in filteredProjects" 
          :key="project.id" 
          :project="project"
        />
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-border rounded-2xl bg-card/50">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Package class="w-6 h-6" />
        </div>
        <div class="text-center">
          <h3 class="font-semibold text-lg text-foreground">No projects found</h3>
          <p class="text-sm text-muted-foreground max-w-sm mt-1">
            We couldn't find any projects matching your search criteria or filters.
          </p>
        </div>
        <Button variant="outline" @click="clearFilters" class="mt-2 flex items-center gap-2">
          <RotateCcw class="w-4 h-4" /> Clear filters
        </Button>
      </div>
    </div>
  </div>
</template>