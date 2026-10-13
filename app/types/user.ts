import type { ProjectEntity } from './project'

export interface UserEntity {
	id: string
	githubId: number
	login: string
	avatarUrl: string
	bio: string
	createdAt: string | Date
	projects?: ProjectEntity[]
}
