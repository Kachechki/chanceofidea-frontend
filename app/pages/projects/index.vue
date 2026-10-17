<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Search, RotateCcw, Package, Tag } from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { useProjectsStore } from '~/stores/projectsStore'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const {
	searchQuery,
	selectedTag,
	selectedSort,
	filteredProjects,
	loading,
	error,
} = storeToRefs(projectsStore)
const { clearFilters } = projectsStore

// Filters start from the URL so a shared link reproduces the same view
searchQuery.value = (route.query.q as string) || ''
selectedTag.value = (route.query.tag as string) || 'all'
selectedSort.value = ((route.query.sort as string) ||
	'newest') as typeof selectedSort.value

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

onMounted(() => projectsStore.fetchProjects())

// Keep the URL in sync with the filters (debounced)
let searchTimeout: ReturnType<typeof setTimeout>
watch([searchQuery, selectedTag, selectedSort], () => {
	clearTimeout(searchTimeout)
	searchTimeout = setTimeout(() => {
		router.replace({
			query: {
				q: searchQuery.value || undefined,
				tag: selectedTag.value !== 'all' ? selectedTag.value : undefined,
				sort: selectedSort.value !== 'newest' ? selectedSort.value : undefined,
			},
		})
	}, 300)
})
</script>

<template>
	<div class="max-w-7xl mx-auto px-8 py-10 flex flex-col gap-8">
		<div class="flex flex-col gap-2">
			<h1 class="text-3xl font-bold text-foreground">Project Catalog</h1>
			<p class="text-muted-foreground text-sm">
				Explore open-source abandoned projects, find your next codebase, and
				adopt it.
			</p>
		</div>

		<div
			class="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border"
		>
			<div class="relative w-full md:w-96">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
				/>
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
					<option value="name">Sort: Name</option>
				</select>
			</div>
		</div>

		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
				<span
					class="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1"
				>
					<Tag class="w-3.5 h-3.5" /> Categories:
				</span>
				<button
					v-for="cat in categories"
					:key="cat.id"
					@click="selectedTag = cat.id"
					:class="[
						'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer border',
						selectedTag === cat.id
							? 'bg-accent text-accent-foreground border-primary font-semibold'
							: 'bg-background text-muted-foreground border-border hover:border-muted-foreground',
					]"
				>
					{{ cat.label }}
				</button>
			</div>
		</div>

		<div class="min-h-[400px]">
			<p
				v-if="error"
				class="mb-4 text-sm text-destructive"
			>
				{{ error }}
			</p>

			<div
				v-if="filteredProjects.length > 0"
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				<ProjectCard
					v-for="project in filteredProjects"
					:key="project.id"
					:project="project"
				/>
			</div>

			<div
				v-else-if="loading"
				class="py-20 text-center text-muted-foreground"
			>
				Loading projects...
			</div>

			<div
				v-else
				class="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
			>
				<div
					class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
				>
					<Package class="w-6 h-6" />
				</div>
				<div class="text-center">
					<h3 class="font-semibold text-lg text-foreground">
						No projects found
					</h3>
					<p class="text-sm text-muted-foreground max-w-sm mt-1">
						We couldn't find any projects matching your search criteria or
						filters.
					</p>
				</div>
				<Button
					variant="outline"
					@click="clearFilters"
					class="mt-2 flex items-center gap-2"
				>
					<RotateCcw class="w-4 h-4" /> Clear filters
				</Button>
			</div>
		</div>
	</div>
</template>
