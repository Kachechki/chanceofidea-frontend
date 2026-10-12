export enum ProjectStatusEnum {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	TRANSFERRING = 'TRANSFERRING',
	ADOPTED = 'ADOPTED',
}

export interface Tag {
	id: string
	name: string
}

export interface ProjectEntity {
	id: string
	title: string
	status: ProjectStatusEnum
	readiness?: number
	description: string
	repositoryId: number
	repostoryUrl: string
	createdAt: string | Date
	owner?: any // or a User interface
	category?: any // or a Category interface
	tags: Tag[]
}
