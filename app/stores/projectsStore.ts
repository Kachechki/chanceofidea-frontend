import {
	type ProjectEntity,
	ProjectStatusEnum,
	type Tag,
} from '~/types/project'
import { defineStore } from 'pinia'

export const useProjectsStore = defineStore('projects', {
	state: () => ({
		projects: [] as ProjectEntity[],
		searchQuery: '',
	}),
	getters: {
		filteredProjects(): ProjectEntity[] {
			if (!this.searchQuery.trim()) return this.projects

			const query = this.searchQuery.toLowerCase().trim()

			return this.projects.filter((project) => {
				const matchesTitle = project.title.toLowerCase().includes(query)
				const matchesDescription = project.description
					.toLowerCase()
					.includes(query)
				const matchesTags = project.tags.some((tag: Tag) =>
					tag.name.toLowerCase().includes(query)
				)

				return matchesTitle || matchesDescription || matchesTags
			})
		},
	},
	actions: {
		getProjectById(id: string): ProjectEntity | undefined {
			return this.projects.find((project) => project.id === id)
		},
		fetchProjects() {},
	},
})
