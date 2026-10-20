import type { UserEntity } from './user'
import type { CategoryEntity } from './category'
import type { TagEntity } from './tag'

export enum ProjectStatusEnum {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	TRANSFERRING = 'TRANSFERRING',
	ADOPTED = 'ADOPTED',
}

export interface ProjectEntity {
	id: string
	title: string
	status: ProjectStatusEnum
	readiness?: number
	description: string
	repositoryName: string // repo name only; full name is owner.login + '/' + repositoryName
	createdAt: string | Date
	owner?: UserEntity
	category?: CategoryEntity
	tags: TagEntity[]
}
