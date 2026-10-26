import { ApplicationStatusEnum, type ApplicationEntity } from '~/types/application'
import { ProjectStatusEnum, type ProjectEntity } from '~/types/project'

// reject reason values the backend writes when a transfer fails or is declined
export const TRANSFER_FAILED_REASON = 'repository transfer failed'
export const TRANSFER_DECLINED_REASON = 'applicant declined the repository'

export type Viewer = 'owner' | 'applicant'

export type TransferStage =
	| 'review'
	| 'waiting-owner'
	| 'waiting-applicant'
	| 'action-needed'
	| 'adopted'
	| 'declined'
	| 'failed'
	| 'rejected'
	| 'closed'

export interface StageCopy {
	variant: 'info' | 'warning' | 'success' | 'danger' | 'neutral'
	title: string
	steps: string[]
}

// the next step for one application, seen from one side
export const applicationStage = (
	application: ApplicationEntity,
	viewer: Viewer
): TransferStage => {
	if (application.status === ApplicationStatusEnum.PENDING)
		return viewer === 'owner' ? 'review' : 'waiting-owner'

	if (application.status === ApplicationStatusEnum.REJECTED) {
		if (application.rejectReason === TRANSFER_FAILED_REASON) return 'failed'
		if (application.rejectReason === TRANSFER_DECLINED_REASON) return 'declined'
		return 'rejected'
	}

	if (application.project?.status === ProjectStatusEnum.ADOPTED) return 'adopted'
	// accepted, but the project is no longer transferring (e.g. a decline reset it)
	if (application.project && application.project.status !== ProjectStatusEnum.TRANSFERRING)
		return 'closed'
	return viewer === 'owner' ? 'waiting-applicant' : 'action-needed'
}

interface CopyContext {
	viewer: Viewer
	applicantLogin: string
	ownerLogin: string
	reason?: string | null
}

// the title and numbered steps shown to each side for a stage
export const stageCopy = (stage: TransferStage, ctx: CopyContext): StageCopy => {
	const applicant = ctx.applicantLogin
	const owner = ctx.ownerLogin

	if (ctx.viewer === 'owner') {
		switch (stage) {
			case 'review':
				return {
					variant: 'info',
					title: 'Review this application',
					steps: [
						'Read the motivation and the action plan.',
						'Accept to start the GitHub transfer, or reject with a reason.',
					],
				}
			case 'waiting-applicant':
				return {
					variant: 'warning',
					title: `Waiting for @${applicant} to take over the repository`,
					steps: [
						`GitHub has sent @${applicant} a transfer request. They have to accept it on GitHub.`,
						`Then they confirm receipt here. The project becomes adopted.`,
						'Nothing to do for you right now.',
					],
				}
			case 'adopted':
				return {
					variant: 'success',
					title: `Transferred to @${applicant}`,
					steps: [
						`The repository now belongs to @${applicant}.`,
						'The project is marked as adopted.',
					],
				}
			case 'declined':
				return {
					variant: 'neutral',
					title: `@${applicant} declined the transfer`,
					steps: [
						'The repository stays with you.',
						'The project is open for applications again.',
					],
				}
			case 'failed':
				return {
					variant: 'danger',
					title: 'The GitHub transfer request failed',
					steps: [
						'Nothing changed on the repository.',
						'The project was returned to draft. Republish it to open it for applications again.',
						'If this keeps happening, check the GitHub App permissions.',
					],
				}
			case 'rejected':
				return {
					variant: 'neutral',
					title: 'You rejected this application',
					steps: [
						ctx.reason ? `The applicant sees your reason: ${ctx.reason}` : 'The applicant sees your reason.',
						'The project stays open for other applicants.',
					],
				}
			case 'closed':
				return {
					variant: 'neutral',
					title: 'This transfer is closed',
					steps: [
						'The repository was not transferred to the applicant.',
						'The project is open again, or in draft if the transfer failed.',
					],
				}
			default:
				return { variant: 'info', title: '', steps: [] }
		}
	}

	switch (stage) {
		case 'waiting-owner':
			return {
				variant: 'info',
				title: 'Waiting for the owner to review your request',
				steps: [
					'The owner sees your request on their Requests tab.',
					'If they accept, you will be asked to take over the repository on GitHub.',
				],
			}
		case 'action-needed':
			return {
				variant: 'warning',
				title: 'Action needed: accept the repository on GitHub',
				steps: [
					'Open your GitHub notifications and accept the transfer request for this repository.',
					'Come back to the Transfers tab and confirm that you received it.',
					`If you do not want the repository, decline instead. It goes back to @${owner}.`,
				],
			}
		case 'adopted':
			return {
				variant: 'success',
				title: 'You own this repository now',
				steps: [
					'The repository is on your GitHub account.',
					'The project is listed as adopted.',
				],
			}
		case 'declined':
			return {
				variant: 'neutral',
				title: 'You declined this transfer',
				steps: [
					`The repository stays with @${owner}.`,
					'The project is open for applications again.',
				],
			}
		case 'failed':
			return {
				variant: 'danger',
				title: 'The transfer could not start',
				steps: [
					'GitHub did not send the transfer request, so nothing changed.',
					'The project is a draft again. The owner has to republish it before you can apply.',
				],
			}
		case 'closed':
			return {
				variant: 'neutral',
				title: 'This transfer is closed',
				steps: [
					`The repository was not transferred to you.`,
					'The project is no longer waiting on your answer.',
				],
			}
		case 'rejected':
			return {
				variant: 'neutral',
				title: `@${owner} declined your request`,
				steps: [
					ctx.reason ? `Reason: ${ctx.reason}` : 'No reason was given.',
					'You can apply to other projects.',
				],
			}
		default:
			return { variant: 'info', title: '', steps: [] }
	}
}

interface ProjectBannerContext {
	isOwner: boolean
	// the accepted application on this project, seen from the viewer's side
	accepted?: ApplicationEntity
	// the viewer's latest rejected application, when they have no active one
	lastRejected?: ApplicationEntity
}

// the banner for the project page, or null when nothing is pending for the project
export const projectBanner = (
	project: ProjectEntity,
	ctx: ProjectBannerContext
): StageCopy | null => {
	const ownerLogin = project.owner?.login ?? 'unknown'

	if (project.status === ProjectStatusEnum.ADOPTED) {
		if (ctx.isOwner) {
			return {
				variant: 'success',
				title: 'You adopted this project',
				steps: [
					'The repository is on your GitHub account.',
					'The project is no longer open for applications.',
				],
			}
		}
		return {
			variant: 'success',
			title: `Adopted by @${ownerLogin}`,
			steps: [
				`The repository belongs to @${ownerLogin} now.`,
				'The project is no longer open for applications.',
			],
		}
	}

	if (project.status === ProjectStatusEnum.TRANSFERRING) {
		if (ctx.accepted) {
			const viewer: Viewer = ctx.isOwner ? 'owner' : 'applicant'
			const applicantLogin = ctx.accepted.applicant?.login ?? 'unknown'
			return stageCopy(applicationStage(ctx.accepted, viewer), {
				viewer,
				applicantLogin,
				ownerLogin,
			})
		}
		return {
			variant: 'info',
			title: 'This project is being transferred to a new owner',
			steps: ['Nothing to do here. The outcome will appear on this page.'],
		}
	}

	if (!ctx.isOwner && ctx.lastRejected) {
		return stageCopy(applicationStage(ctx.lastRejected, 'applicant'), {
			viewer: 'applicant',
			applicantLogin: '',
			ownerLogin,
			reason: ctx.lastRejected.rejectReason,
		})
	}

	return null
}
