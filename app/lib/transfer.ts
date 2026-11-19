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
	const { $i18n } = useNuxtApp()
	const applicant = ctx.applicantLogin
	const owner = ctx.ownerLogin

	if (ctx.viewer === 'owner') {
		switch (stage) {
			case 'review':
				return {
					variant: 'info',
					title: $i18n.t('transfer.owner.reviewTitle'),
					steps: [
						$i18n.t('transfer.owner.review1'),
						$i18n.t('transfer.owner.review2'),
					],
				}
			case 'waiting-applicant':
				return {
					variant: 'warning',
					title: $i18n.t('transfer.owner.waitingTitle', { applicant }),
					steps: [
						$i18n.t('transfer.owner.waiting1', { applicant }),
						$i18n.t('transfer.owner.waiting2'),
						$i18n.t('transfer.owner.waiting3'),
					],
				}
			case 'adopted':
				return {
					variant: 'success',
					title: $i18n.t('transfer.owner.adoptedTitle', { applicant }),
					steps: [
						$i18n.t('transfer.owner.adopted1', { applicant }),
						$i18n.t('transfer.owner.adopted2'),
					],
				}
			case 'declined':
				return {
					variant: 'neutral',
					title: $i18n.t('transfer.owner.declinedTitle', { applicant }),
					steps: [
						$i18n.t('transfer.owner.declined1'),
						$i18n.t('transfer.owner.declined2'),
					],
				}
			case 'failed':
				return {
					variant: 'danger',
					title: $i18n.t('transfer.owner.failedTitle'),
					steps: [
						$i18n.t('transfer.owner.failed1'),
						$i18n.t('transfer.owner.failed2'),
						$i18n.t('transfer.owner.failed3'),
					],
				}
			case 'rejected':
				return {
					variant: 'neutral',
					title: $i18n.t('transfer.owner.rejectedTitle'),
					steps: [
						ctx.reason
							? $i18n.t('transfer.owner.rejectedReason', { reason: ctx.reason })
							: $i18n.t('transfer.owner.rejectedNoReason'),
						$i18n.t('transfer.owner.rejectedOpen'),
					],
				}
			case 'closed':
				return {
					variant: 'neutral',
					title: $i18n.t('transfer.owner.closedTitle'),
					steps: [
						$i18n.t('transfer.owner.closed1'),
						$i18n.t('transfer.owner.closed2'),
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
				title: $i18n.t('transfer.applicant.waitingTitle'),
				steps: [
					$i18n.t('transfer.applicant.waiting1'),
					$i18n.t('transfer.applicant.waiting2'),
				],
			}
		case 'action-needed':
			return {
				variant: 'warning',
				title: $i18n.t('transfer.applicant.actionTitle'),
				steps: [
					$i18n.t('transfer.applicant.action1'),
					$i18n.t('transfer.applicant.action2'),
					$i18n.t('transfer.applicant.action3', { owner }),
				],
			}
		case 'adopted':
			return {
				variant: 'success',
				title: $i18n.t('transfer.applicant.adoptedTitle'),
				steps: [
					$i18n.t('transfer.applicant.adopted1'),
					$i18n.t('transfer.applicant.adopted2'),
				],
			}
		case 'declined':
			return {
				variant: 'neutral',
				title: $i18n.t('transfer.applicant.declinedTitle'),
				steps: [
					$i18n.t('transfer.applicant.declined1', { owner }),
					$i18n.t('transfer.applicant.declined2'),
				],
			}
		case 'failed':
			return {
				variant: 'danger',
				title: $i18n.t('transfer.applicant.failedTitle'),
				steps: [
					$i18n.t('transfer.applicant.failed1'),
					$i18n.t('transfer.applicant.failed2'),
				],
			}
		case 'closed':
			return {
				variant: 'neutral',
				title: $i18n.t('transfer.applicant.closedTitle'),
				steps: [
					$i18n.t('transfer.applicant.closed1'),
					$i18n.t('transfer.applicant.closed2'),
				],
			}
		case 'rejected':
			return {
				variant: 'neutral',
				title: $i18n.t('transfer.applicant.rejectedTitle', { owner }),
				steps: [
					ctx.reason
						? $i18n.t('transfer.applicant.rejectedReason', { reason: ctx.reason })
						: $i18n.t('transfer.applicant.rejectedNoReason'),
					$i18n.t('transfer.applicant.rejectedOther'),
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
	const { $i18n } = useNuxtApp()
	const ownerLogin = project.owner?.login ?? $i18n.t('common.unknown')

	if (project.status === ProjectStatusEnum.ADOPTED) {
		if (ctx.isOwner) {
			return {
				variant: 'success',
				title: $i18n.t('transfer.banner.ownerAdoptedTitle'),
				steps: [
					$i18n.t('transfer.banner.ownerAdopted1'),
					$i18n.t('transfer.banner.ownerAdopted2'),
				],
			}
		}
		return {
			variant: 'success',
			title: $i18n.t('transfer.banner.adoptedByTitle', { owner: ownerLogin }),
			steps: [
				$i18n.t('transfer.banner.adoptedBy1', { owner: ownerLogin }),
				$i18n.t('transfer.banner.adoptedBy2'),
			],
		}
	}

	if (project.status === ProjectStatusEnum.TRANSFERRING) {
		if (ctx.accepted) {
			const viewer: Viewer = ctx.isOwner ? 'owner' : 'applicant'
			const applicantLogin = ctx.accepted.applicant?.login ?? $i18n.t('common.unknown')
			return stageCopy(applicationStage(ctx.accepted, viewer), {
				viewer,
				applicantLogin,
				ownerLogin,
			})
		}
		return {
			variant: 'info',
			title: $i18n.t('transfer.banner.transferringTitle'),
			steps: [$i18n.t('transfer.banner.transferring1')],
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
