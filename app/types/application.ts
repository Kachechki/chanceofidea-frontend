import type { ProjectEntity } from './project'
import type { UserEntity } from './user'

export enum ApplicationStatusEnum {
	PENDING = 'PENDING',
	ACCEPTED = 'ACCEPTED',
	REJECTED = 'REJECTED',
}

export interface ApplicationEntity {
	id: string
	applicant?: UserEntity
	project?: ProjectEntity
	whyMe: string
	plan?: string | null
	// backend entity column is spelled "portflioUrl"
	portflioUrl?: string | null
	status: ApplicationStatusEnum
	rejectReason?: string | null
	createdAt: string | Date
	updatedAt: string | Date
}

export interface CreateApplicationInput {
	projectId: string
	whyMe: string
	plan: string
	portfolioUrl?: string
}

const TRANSITIONS: Record<ApplicationStatusEnum, ApplicationStatusEnum[]> = {
	[ApplicationStatusEnum.PENDING]: [
		ApplicationStatusEnum.ACCEPTED,
		ApplicationStatusEnum.REJECTED,
	],
	[ApplicationStatusEnum.ACCEPTED]: [],
	[ApplicationStatusEnum.REJECTED]: [],
}

export const canTransition = (
	from: ApplicationStatusEnum,
	to: ApplicationStatusEnum
) => TRANSITIONS[from].includes(to)

export const isActiveApplication = (application: ApplicationEntity) =>
	application.status !== ApplicationStatusEnum.REJECTED
