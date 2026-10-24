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

// requestCard shows the applicant. on the outgoing side the viewer is the applicant,
// so the card shows the project instead. the outgoing endpoint doesn't load the
// project relation, so the card falls back to the project id until the backend adds it.
const toRequestView = (
	application: ApplicationEntity,
	mode: 'incoming' | 'outgoing'
): AdoptionRequestEntity => ({
	id: application.id,
	repoName: mode === 'incoming' ? application.project?.repositoryName : undefined,
	createdAt: new Date(application.createdAt).toLocaleDateString('uk-UA'),
	status: STATUS_LABEL[application.status],
	whyMe: application.whyMe,
	actionPlan: application.plan ?? '',
	portfolioUrl: application.portflioUrl ?? '',
	applicant:
		mode === 'incoming'
			? {
					id: application.applicant?.id ?? '',
					name: application.applicant?.login ?? 'unknown',
					avatar: application.applicant?.avatarUrl,
				}
			: {
					id: application.project?.id ?? '',
					name: application.project?.title ?? 'Unknown project',
					avatar: application.project?.owner?.avatarUrl,
				},
})

export const useRequestsStore = defineStore('requests', {
	state: () => ({
		// applications I sent
		outgoing: [] as ApplicationEntity[],
		// applications received on projects I own
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

		// my non-rejected application for a project, if any
		// needs the project relation on outgoing items. without it this never matches.
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

		async apply(input: CreateApplicationInput) {
			this.error = null
			try {
				// the DTO spells it "porfolioUrl"; the key must match exactly
				await $fetch('/api/application', {
					method: 'POST',
					body: {
						projectId: input.projectId,
						whyMe: input.whyMe,
						plan: input.plan,
						porfolioUrl: input.portfolioUrl,
					},
				})
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
					query: { applicationId: id },
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
					query: { applicationId: id },
					body: { rejectReason: reason },
				})
			} catch (err) {
				this.error = errorMessage(err, 'Failed to reject application')
				throw err
			}
			await this.fetchIncoming()
		},
	},
})
