import type { ProjectEntity } from './project'
import type { UserEntity } from './user'

export enum ApplicationStatusEnum {
	PENDING = 'PENDING',
	ACCEPTED = 'ACCEPTED',
	REJECTED = 'REJECTED',
}

export interface ApplicationEntity {
	id: string
	applicant: UserEntity
	project: ProjectEntity
	whyMe: string
	plan?: string | null
	portfolioUrl?: string | null
	status: ApplicationStatusEnum
	rejectReason?: string | null
	createdAt: string | Date
	updatedAt: string | Date
}

// Mirrors the backend ICreateApplication
export interface CreateApplicationInput {
	projectId: string
	whyMe: string
	plan: string
	portfolioUrl?: string
}

// Request state machine: a PENDING application can be accepted or rejected. Both are final.
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

// The backend allows one non-rejected application per applicant per project
export const isActiveApplication = (application: ApplicationEntity) =>
	application.status !== ApplicationStatusEnum.REJECTED
