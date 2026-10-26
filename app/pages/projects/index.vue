<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Search, RotateCcw, Package, Tag, Folder } from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { ALL_CATEGORY_ID } from '~/types/category'
import type { ProjectSort } from '~/stores/projectsStore'

useHead({ title: 'Project Catalog' })

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const {
	categories,
	tags,
	searchQuery,
	selectedCategoryId,
	selectedTagIds,
	selectedSort,
	filteredProjects,
	page,
	hasNextPage,
	loading,
	error,
} = storeToRefs(projectsStore)
const { setCategory, toggleTag, clearFilters, goToPage } = projectsStore

const selectedCategorySlug = computed(
	() =>
		categories.value.find(
			(c) => c.id === selectedCategoryId.value && c.id !== ALL_CATEGORY_ID
		)?.slug
)
const selectedTagSlugs = computed(() =>
	tags.value
		.filter((t) => selectedTagIds.value.includes(t.id))
		.map((t) => t.slug)
)

const queryList = (value: unknown): string[] =>
	Array.isArray(value) ? value.map(String) : value ? [String(value)] : []

onMounted(async () => {
	await Promise.all([
		projectsStore.fetchCategories(),
		projectsStore.fetchTags(),
	])

	searchQuery.value = String(route.query.q ?? '')

	const sort = String(route.query.sort ?? 'newest')
	if (['newest', 'readiness', 'name'].includes(sort)) {
		selectedSort.value = sort as ProjectSort
	}

	const categorySlug = String(route.query.category ?? '')
	selectedCategoryId.value =
		categories.value.find((c) => c.slug === categorySlug)?.id ?? ALL_CATEGORY_ID

	const tagSlugs = queryList(route.query.tag)
	selectedTagIds.value = tags.value
		.filter((t) => tagSlugs.includes(t.slug))
		.map((t) => t.id)

	// a fresh visit always starts on the first page
	const requestedPage = Math.max(1, Number.parseInt(String(route.query.page ?? '1'), 10) || 1)
	await projectsStore.fetchProjects(requestedPage)
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(
	[searchQuery, selectedCategorySlug, selectedTagSlugs, selectedSort, page],
	() => {
		clearTimeout(searchTimeout)
		searchTimeout = setTimeout(() => {
			router.replace({
				query: {
					q: searchQuery.value || undefined,
					category: selectedCategorySlug.value,
					tag:
						selectedTagSlugs.value.length > 0
							? selectedTagSlugs.value
							: undefined,
					sort:
						selectedSort.value !== 'newest' ? selectedSort.value : undefined,
					page: page.value > 1 ? page.value : undefined,
				},
			})
		}, 300)
	},
	{ deep: true }
)
</script>

<template>
	<div class="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
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
					type="search"
					aria-label="Search projects"
					placeholder="Search loaded projects by title, description or tag..."
					class="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
				/>
			</div>

			<div class="flex items-center gap-3 w-full md:w-auto justify-end">
				<select
					v-model="selectedSort"
					aria-label="Sort projects"
					class="px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none"
				>
					<option value="newest">Sort: Newest</option>
					<option value="readiness">Sort: Readiness</option>
					<option value="name">Sort: Name</option>
				</select>
			</div>
		</div>

		<div class="flex flex-col gap-3" role="group" aria-labelledby="filter-categories">
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
				<span
					id="filter-categories"
					class="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1"
				>
					<Folder class="w-3.5 h-3.5" aria-hidden="true" /> Categories:
				</span>
				<button
					v-for="cat in categories"
					:key="cat.id"
					type="button"
					:aria-pressed="selectedCategoryId === cat.id"
					@click="setCategory(cat.id)"
					:class="[
						'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer border',
						selectedCategoryId === cat.id
							? 'bg-accent text-accent-foreground border-primary font-semibold'
							: 'bg-background text-muted-foreground border-border hover:border-muted-foreground',
					]"
				>
					{{ cat.name }}
				</button>
			</div>
		</div>

		<div class="flex flex-col gap-3 -mt-6" role="group" aria-labelledby="filter-tags">
			<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
				<span
					id="filter-tags"
					class="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1"
				>
					<Tag class="w-3.5 h-3.5" aria-hidden="true" /> Tags:
				</span>
				<button
					v-for="tag in tags"
					:key="tag.id"
					type="button"
					:aria-pressed="selectedTagIds.includes(tag.id)"
					@click="toggleTag(tag.id)"
					:class="[
						'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer border',
						selectedTagIds.includes(tag.id)
							? 'bg-accent text-accent-foreground border-primary font-semibold'
							: 'bg-background text-muted-foreground border-border hover:border-muted-foreground',
					]"
				>
					{{ tag.name }}
				</button>
			</div>
		</div>

		<div class="min-h-[400px]">
			<p
				v-if="error"
				role="alert"
				class="mb-4 text-sm text-destructive"
			>
				{{ error }}
			</p>

			<p role="status" aria-live="polite" class="sr-only">
				{{ filteredProjects.length }} projects found
			</p>

			<ul
				v-if="filteredProjects.length > 0"
				aria-label="Projects"
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				<li v-for="project in filteredProjects" :key="project.id">
					<ProjectCard :project="project" />
				</li>
			</ul>

			<LoadingSpinner v-else-if="loading" />

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

		<nav
			v-if="!loading && (page > 1 || hasNextPage)"
			aria-label="Project pages"
			class="flex items-center justify-center gap-4"
		>
			<Button
				variant="outline"
				:disabled="page === 1"
				@click="goToPage(page - 1)"
			>
				Previous
			</Button>
			<span class="text-sm text-muted-foreground" aria-current="page">
				Page {{ page }}
			</span>
			<Button
				variant="outline"
				:disabled="!hasNextPage"
				@click="goToPage(page + 1)"
			>
				Next
			</Button>
		</nav>
	</div>
</template>
