import { defineStore } from 'pinia'
import { type ProjectEntity } from '~/types/project'
import type { UserEntity } from '~/types/user'
import type { CategoryEntity } from '~/types/category'
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
		// Catalog (all published projects)
		projects: [] as ProjectEntity[],
		// Projects owned by the logged-in user (profile page)
		myProjects: [] as ProjectEntity[],
		// Last project loaded by id (detail page)
		currentProject: null as ProjectEntity | null,
		// Options for the create form
		categories: [] as CategoryEntity[],
		tags: [] as TagEntity[],

		// Catalog filters
		searchQuery: '',
		selectedTag: 'all',
		selectedSort: 'newest' as ProjectSort,

		loading: false,
		error: null as string | null,
	}),

	getters: {
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

			if (state.selectedTag !== 'all') {
				result = result.filter((p) =>
					p.tags?.some(
						(t) =>
							t.slug === state.selectedTag ||
							t.name.toLowerCase() === state.selectedTag
					)
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

		clearFilters() {
			this.searchQuery = ''
			this.selectedTag = 'all'
			this.selectedSort = 'newest'
		},

		async fetchProjects() {
			this.loading = true
			this.error = null
			try {
				// GET /project without an id is not a list endpoint on the backend; use the filter route
				this.projects = await $fetch<ProjectEntity[]>('/api/project/projects/0')
			} catch (err) {
				this.error = errorMessage(err, 'Failed to load projects')
			} finally {
				this.loading = false
			}
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

		// Options for the create form. Endpoints are assumed; confirm against the backend.
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