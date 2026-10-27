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
import { applicationStage, stageCopy } from '~/lib/transfer'

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
	mode: 'incoming' | 'outgoing',
): AdoptionRequestEntity => {
	const viewer = mode === 'incoming' ? 'owner' : 'applicant'
	const applicantLogin = application.applicant?.login ?? ''
	const ownerLogin = application.project?.owner?.login ?? ''

	return {
		id: application.id,
		repoName:
			mode === 'incoming' ? application.project?.repositoryName : undefined,
		// pending requests already show accept/reject, so only later stages get a banner
		transfer:
			application.status === ApplicationStatusEnum.PENDING
				? undefined
				: stageCopy(applicationStage(application, viewer), {
						viewer,
						applicantLogin,
						ownerLogin,
						reason: application.rejectReason,
					}),
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
	}
}

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

		// accepted applications I sent, which are the transfers waiting on me
		applicantTransfers(state): ApplicationEntity[] {
			return state.outgoing.filter(
				(a) => a.status === ApplicationStatusEnum.ACCEPTED,
			)
		},

		// my non-rejected application for a project, if any
		// needs the project relation on outgoing items. without it this never matches.
		activeForProject: (state) => (projectId: string) =>
			state.outgoing.find(
				(a) => a.project?.id === projectId && isActiveApplication(a),
			),
	},

	actions: {
		async fetchIncoming() {
			this.loading = true
			this.error = null
			try {
				this.incoming = await $fetch<ApplicationEntity[]>(
					'/api/application/incoming',
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
					'/api/application/outcoming',
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

		// the applicant received the repo on github. the backend checks github before it records this
		async confirmReceived(applicationId: string) {
			this.error = null
			try {
				await $fetch('/api/transfer-session/i-have-recieved', {
					method: 'POST',
					query: { applicationId },
				})
			} catch (err) {
				this.error = errorMessage(err, 'Could not confirm the transfer')
				throw err
			}
			await this.fetchOutgoing()
		},

		// the applicant does not want the repo. the project goes back to its owner
		async declineTransfer(applicationId: string) {
			this.error = null
			try {
				await $fetch('/api/transfer-session/i-dont-want', {
					method: 'POST',
					query: { applicationId },
				})
			} catch (err) {
				this.error = errorMessage(err, 'Could not decline the transfer')
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
				// the deployed guard still reads the project id from the query
				await $fetch('/api/application/accept', {
					method: 'POST',
					query: {
						id,
						//applicationId: id,
						//id: application?.project?.id,
					},
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
					query: {
						id,
						//applicationId: id,
						//id: application?.project?.id,
					},
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
