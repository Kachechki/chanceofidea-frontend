import { defineStore } from 'pinia'
import { errorMessage } from '~/lib/errors'
import {
	ApplicationStatusEnum,
	canTransition,
	isActiveApplication,
	type ApplicationEntity,
	type CreateApplicationInput,
} from '~/types/application'
import type { AdoptionRequestEntity } from '~/components/RequestCard.vue'

const STATUS_LABEL: Record<
	ApplicationStatusEnum,
	AdoptionRequestEntity['status']
> = {
	[ApplicationStatusEnum.PENDING]: 'Pending',
	[ApplicationStatusEnum.ACCEPTED]: 'Accepted',
	[ApplicationStatusEnum.REJECTED]: 'Rejected',
}

// RequestCard shows the applicant. On the outgoing side the viewer is the applicant,
// so the card shows the project instead.
const toRequestView = (
	application: ApplicationEntity,
	mode: 'incoming' | 'outgoing'
): AdoptionRequestEntity => ({
	id: application.id,
	createdAt: new Date(application.createdAt).toLocaleDateString('uk-UA'),
	status: STATUS_LABEL[application.status],
	whyMe: application.whyMe,
	actionPlan: application.plan ?? '',
	portfolioUrl: application.portfolioUrl ?? '',
	applicant:
		mode === 'incoming'
			? {
					id: application.applicant.id,
					name: application.applicant.login,
					avatar: application.applicant.avatarUrl,
				}
			: {
					id: application.project.id,
					name: application.project.title,
					avatar: application.project.owner?.avatarUrl,
				},
})

// Endpoints are assumed (the backend has no application controller yet). Confirm before relying on them.
export const useRequestsStore = defineStore('requests', {
	state: () => ({
		// Applications I sent
		outgoing: [] as ApplicationEntity[],
		// Applications received on projects I own
		incoming: [] as ApplicationEntity[],
		loading: false,
		error: null as string | null,
	}),

	getters: {
		incomingRequests(state): AdoptionRequestEntity[] {
			return state.incoming.map((a) => toRequestView(a, 'incoming'))
		},

		outgoingRequests(state): AdoptionRequestEntity[] {
			return state.outgoing.map((a) => toRequestView(a, 'outgoing'))
		},

		// My non-rejected application for a project, if any
		activeForProject: (state) => (projectId: string) =>
			state.outgoing.find(
				(a) => a.project?.id === projectId && isActiveApplication(a)
			),
	},

	actions: {
		async fetchIncoming() {
			this.loading = true
			this.error = null
			try {
				this.incoming = await $fetch<ApplicationEntity[]>(
					'/api/application/incoming'
				)
			} catch (err) {
				this.incoming = []
				this.error = errorMessage(err, 'Failed to load incoming applications')
			} finally {
				this.loading = false
			}
		},

		async fetchOutgoing() {
			this.loading = true
			this.error = null
			try {
				this.outgoing = await $fetch<ApplicationEntity[]>(
					'/api/application/outcoming'
				)
			} catch (err) {
				this.outgoing = []
				this.error = errorMessage(err, 'Failed to load your applications')
			} finally {
				this.loading = false
			}
		},

		async fetchRequests() {
			await Promise.all([this.fetchIncoming(), this.fetchOutgoing()])
		},

		// Throws on failure so the caller can show the message
		async apply(input: CreateApplicationInput) {
			this.error = null
			try {
				await $fetch('/api/application', { method: 'POST', body: input })
			} catch (err) {
				this.error = errorMessage(err, 'Failed to send application')
				throw err
			}
			await this.fetchOutgoing()
		},

		async acceptRequest(id: string) {
			const application = this.incoming.find((a) => a.id === id)
			if (
				application &&
				!canTransition(application.status, ApplicationStatusEnum.ACCEPTED)
			) {
				throw new Error('This application is already decided')
			}

			this.error = null
			try {
				await $fetch('/api/application/accept', {
					method: 'POST',
					query: { id },
				})
			} catch (err) {
				this.error = errorMessage(err, 'Failed to accept application')
				throw err
			}
			await this.fetchIncoming()
		},

		async rejectRequest(id: string, reason: string) {
			const application = this.incoming.find((a) => a.id === id)
			if (
				application &&
				!canTransition(application.status, ApplicationStatusEnum.REJECTED)
			) {
				throw new Error('This application is already decided')
			}

			this.error = null
			try {
				await $fetch('/api/application/reject', {
					method: 'POST',
					query: { id },
					body: { reason },
				})
			} catch (err) {
				this.error = errorMessage(err, 'Failed to reject application')
				throw err
			}
			await this.fetchIncoming()
		},
	},
})
