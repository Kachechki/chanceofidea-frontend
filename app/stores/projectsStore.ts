import { defineStore } from 'pinia'
import { type ProjectEntity } from '~/types/project'
import type { UserEntity } from '~/types/user'
import { ALL_CATEGORY_ID, type CategoryEntity } from '~/types/category'
import type { TagEntity } from '~/types/tag'
import { getProjectFullName } from '~/lib/project'
import { errorMessage } from '~/lib/errors'
import type { GithubRepository } from '~/types/github'

export type ProjectSort = 'newest' | 'readiness' | 'name'

// must match the backend page size (skip = (page - 1) * 20, pages start at 1)
const PROJECTS_PAGE_SIZE = 20
let projectsRequestId = 0

export interface CreateProjectInput {
	title: string
	description: string
	repositoryName: string
	categoryId: string
	tags: string[]
	publish: boolean
	readiness?: number
}

export const useProjectsStore = defineStore('projects', {
	state: () => ({
		projects: [] as ProjectEntity[],
		// pagination: the backend returns 20 per page and no total count
		page: 1,
		hasNextPage: false,
		myProjects: [] as ProjectEntity[],
		currentProject: null as ProjectEntity | null,
		categories: [] as CategoryEntity[],
		tags: [] as TagEntity[],
		// public repos owned by the logged-in user (repo picker)
		githubRepos: [] as GithubRepository[],
		githubReposLoading: false,
		githubReposError: null as string | null,

		searchQuery: '',
		selectedCategoryId: ALL_CATEGORY_ID,
		selectedTagIds: [] as string[],
		selectedSort: 'newest' as ProjectSort,

		loading: false,
		error: null as string | null,
	}),

	getters: {
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
		getProjectById(id: string): ProjectEntity | undefined {
			return (
				(this.currentProject?.id === id ? this.currentProject : undefined) ??
				this.projects.find((p) => p.id === id) ??
				this.myProjects.find((p) => p.id === id)
			)
		},

		buildFilterQuery(page = 1) {
			const category = this.categories.find(
				(c) => c.id === this.selectedCategoryId && c.id !== ALL_CATEGORY_ID
			)
			const tagSlugs = this.tags
				.filter((t) => this.selectedTagIds.includes(t.id))
				.map((t) => t.slug)

			return {
				page,
				...(this.searchQuery ? { searchQuery: this.searchQuery } : {}),
				...(category ? { categorySlugs: category.slug } : {}),
				...(tagSlugs.length > 0 ? { tagSlugs } : {}),
			}
		},

		async fetchProjects(page = 1) {
			// only the latest request may write results, so fast clicks can't show stale pages
			const requestId = ++projectsRequestId
			this.loading = true
			this.error = null
			try {
				const result = await $fetch<ProjectEntity[]>('/api/project/projects', {
					query: this.buildFilterQuery(page),
				})
				if (requestId !== projectsRequestId) return
				this.projects = result
				this.page = page
				this.hasNextPage = result.length === PROJECTS_PAGE_SIZE
			} catch (err) {
				if (requestId !== projectsRequestId) return
				this.error = errorMessage(err, 'Failed to load projects')
			} finally {
				if (requestId === projectsRequestId) this.loading = false
			}
		},

		async goToPage(page: number) {
			if (page < 1 || page === this.page) return
			if (page > this.page && !this.hasNextPage) return
			await this.fetchProjects(page)
		},

		async setCategory(id: string) {
			this.selectedCategoryId = id
			await this.fetchProjects(1)
		},

		async toggleTag(id: string) {
			this.selectedTagIds = this.selectedTagIds.includes(id)
				? this.selectedTagIds.filter((t) => t !== id)
				: [...this.selectedTagIds, id]
			await this.fetchProjects(1)
		},

		async clearFilters() {
			this.searchQuery = ''
			this.selectedCategoryId = ALL_CATEGORY_ID
			this.selectedTagIds = []
			this.selectedSort = 'newest'
			await this.fetchProjects(1)
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

		// the backend lists repos for the logged-in user; only public ones can be published
		async fetchGithubRepos() {
			this.githubReposLoading = true
			this.githubReposError = null
			try {
				const repos = await $fetch<GithubRepository[]>(
					'/api/github/repositories'
				)
				this.githubRepos = repos
					.filter((repo) => !repo.private)
					.sort((a, b) => a.name.localeCompare(b.name))
			} catch (err) {
				this.githubRepos = []
				// the backend returns 500 when github rejects the stored token, so treat it like a 401
				const status = (err as { statusCode?: number })?.statusCode
				this.githubReposError =
					status === 401 || status === 403 || status === 500
						? 'Your GitHub access has expired. Log in again to refresh it, then reload to see your repositories.'
						: 'Could not load your repositories. Try again later.'
			} finally {
				this.githubReposLoading = false
			}
		},

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

		replaceIfLoaded(list: ProjectEntity[], project: ProjectEntity) {
			const index = list.findIndex((p) => p.id === project.id)
			if (index !== -1) list[index] = project
		},
	},
})
