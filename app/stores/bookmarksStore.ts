import { defineStore } from 'pinia'
import type { ProjectEntity } from '~/types/project'

// bookmarks are kept in this browser, per user, until the backend has bookmarks (B10)
const storageKey = (userId: string) => `bookmarks:${userId}`

export const useBookmarksStore = defineStore('bookmarks', {
	state: () => ({
		userId: null as string | null,
		items: [] as ProjectEntity[],
	}),

	getters: {
		isBookmarked: (state) => (projectId: string) =>
			state.items.some((project) => project.id === projectId),
	},

	actions: {
		// runs when the signed-in user changes. signing out clears the list.
		load(userId: string | null) {
			this.userId = userId
			this.items = []
			if (!userId || typeof localStorage === 'undefined') return

			try {
				const raw = localStorage.getItem(storageKey(userId))
				const parsed: unknown = raw ? JSON.parse(raw) : []
				this.items = Array.isArray(parsed)
					? (parsed as ProjectEntity[]).filter(
							(project) => project && typeof project.id === 'string'
						)
					: []
			} catch {
				this.items = []
			}
		},

		// returns false when nobody is signed in, so the caller can send them to log in
		toggle(project: ProjectEntity): boolean {
			if (!this.userId) return false

			if (this.isBookmarked(project.id)) {
				this.items = this.items.filter((item) => item.id !== project.id)
			} else {
				this.items = [project, ...this.items]
			}
			this.save()
			return true
		},

		// keeps a saved copy in step with the latest project data
		refresh(project: ProjectEntity) {
			if (!this.isBookmarked(project.id)) return
			this.items = this.items.map((item) => (item.id === project.id ? project : item))
			this.save()
		},

		save() {
			if (!this.userId || typeof localStorage === 'undefined') return
			localStorage.setItem(storageKey(this.userId), JSON.stringify(this.items))
		},
	},
})
