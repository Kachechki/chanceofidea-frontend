import { defineStore } from 'pinia'
import { type ProjectEntity } from '~/types/project'
import type { UserEntity } from '~/types/user'
import { ALL_CATEGORY_ID, type CategoryEntity } from '~/types/category'
import type { TagEntity } from '~/types/tag'
import { getProjectFullName } from '~/lib/project'

export type ProjectSort = 'newest' | 'readiness' | 'name'

// Mirrors the backend CreateProjectDto
export interface CreateProjectInput {
	title: string
	description: string
	repositoryName: string
	categoryId: string
	tags: string[]
	publish: boolean
	readiness?: number
}

const errorMessage = (err: unknown, fallback: string) => {
	const data = (err as { data?: { message?: string | string[] } })?.data
	const message = Array.isArray(data?.message)
		? data?.message.join(', ')
		: data?.message
	return message || (err instanceof Error ? err.message : fallback)
}

export const useProjectsStore = defineStore('projects', {
	state: () => ({
		// Catalog (projects matching the server-side filters)
		projects: [] as ProjectEntity[],
		// Projects owned by the logged-in user (profile page)
		myProjects: [] as ProjectEntity[],
		// Last project loaded by id (detail page)
		currentProject: null as ProjectEntity | null,
		// Filter and form options from the backend
		categories: [] as CategoryEntity[],
		tags: [] as TagEntity[],

		// Catalog filters. Category and tags are sent to the server; search and sort run locally.
		searchQuery: '',
		selectedCategoryId: ALL_CATEGORY_ID,
		selectedTagIds: [] as string[],
		selectedSort: 'newest' as ProjectSort,

		loading: false,
		error: null as string | null,
	}),

	getters: {
		// Categories a project can be published under (the all-categories row is filter-only)
		selectableCategories(state): CategoryEntity[] {
			return state.categories.filter((c) => c.id !== ALL_CATEGORY_ID)
		},

		filteredProjects(state): ProjectEntity[] {
			let result = state.projects

			const query = state.searchQuery.toLowerCase().trim()
			if (query) {
				result = result.filter(
					(p) =>
						p.title.toLowerCase().includes(query) ||
						p.description.toLowerCase().includes(query) ||
						p.tags?.some((t) => t.name.toLowerCase().includes(query))
				)
			}

			if (state.selectedSort === 'readiness') {
				result = [...result].sort(
					(a, b) => (b.readiness || 0) - (a.readiness || 0)
				)
			} else if (state.selectedSort === 'newest') {
				result = [...result].sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)
			} else if (state.selectedSort === 'name') {
				result = [...result].sort((a, b) =>
					getProjectFullName(a).localeCompare(getProjectFullName(b))
				)
			}

			return result
		},
	},

	actions: {
		// Local lookup across everything already loaded
		getProjectById(id: string): ProjectEntity | undefined {
			return (
				(this.currentProject?.id === id ? this.currentProject : undefined) ??
				this.projects.find((p) => p.id === id) ??
				this.myProjects.find((p) => p.id === id)
			)
		},

		// The backend filters by slugs, so ids are converted here
		buildFilterQuery() {
			const category = this.categories.find(
				(c) => c.id === this.selectedCategoryId && c.id !== ALL_CATEGORY_ID
			)
			const tagSlugs = this.tags
				.filter((t) => this.selectedTagIds.includes(t.id))
				.map((t) => t.slug)

			return {
				...(category ? { categorySlugs: category.slug } : {}),
				...(tagSlugs.length > 0 ? { tagSlugs } : {}),
			}
		},

		async fetchProjects() {
			this.loading = true
			this.error = null
			try {
				// Page 0 is the first 20 results
				this.projects = await $fetch<ProjectEntity[]>('/api/project/projects/0', {
					query: this.buildFilterQuery(),
				})
			} catch (err) {
				this.error = errorMessage(err, 'Failed to load projects')
			} finally {
				this.loading = false
			}
		},

		async setCategory(id: string) {
			this.selectedCategoryId = id
			await this.fetchProjects()
		},

		async toggleTag(id: string) {
			this.selectedTagIds = this.selectedTagIds.includes(id)
				? this.selectedTagIds.filter((t) => t !== id)
				: [...this.selectedTagIds, id]
			await this.fetchProjects()
		},

		async clearFilters() {
			this.searchQuery = ''
			this.selectedCategoryId = ALL_CATEGORY_ID
			this.selectedTagIds = []
			this.selectedSort = 'newest'
			await this.fetchProjects()
		},

		async fetchProjectById(id: string) {
			this.loading = true
			this.error = null
			try {
				const project = await $fetch<ProjectEntity>('/api/project', {
					query: { id },
				})
				this.currentProject = project
				this.replaceIfLoaded(this.projects, project)
				this.replaceIfLoaded(this.myProjects, project)
				return project
			} catch (err) {
				this.currentProject = null
				this.error = errorMessage(err, 'Failed to load project')
				return null
			} finally {
				this.loading = false
			}
		},

		// Profile: projects of the logged-in user, taken from /me
		async fetchMyProjects() {
			this.loading = true
			this.error = null
			try {
				const me = await $fetch<UserEntity>('/api/user/me')
				this.myProjects = me.projects ?? []
			} catch (err) {
				this.myProjects = []
				this.error = errorMessage(err, 'Failed to load your projects')
			} finally {
				this.loading = false
			}
		},

		async createProject(input: CreateProjectInput) {
			this.loading = true
			this.error = null
			try {
				// Backend returns no body on create, so reload the lists instead
				await $fetch('/api/project', { method: 'POST', body: input })
			} catch (err) {
				this.error = errorMessage(err, 'Failed to create project')
				throw err
			} finally {
				this.loading = false
			}
			await this.fetchMyProjects()
			if (input.publish) await this.fetchProjects()
		},

		// Filter and form options. Endpoints are assumed; confirm against the backend.
		async fetchCategories() {
			try {
				this.categories = await $fetch<CategoryEntity[]>('/api/category')
			} catch (err) {
				this.error = errorMessage(err, 'Failed to load categories')
			}
		},

		async fetchTags() {
			try {
				this.tags = await $fetch<TagEntity[]>('/api/tag')
			} catch (err) {
				this.error = errorMessage(err, 'Failed to load tags')
			}
		},

		// Refresh a cached item in place; never adds, so unpublished projects don't leak into the catalog
		replaceIfLoaded(list: ProjectEntity[], project: ProjectEntity) {
			const index = list.findIndex((p) => p.id === project.id)
			if (index !== -1) list[index] = project
		},
	},
})
