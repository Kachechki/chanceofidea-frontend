import type { ProjectEntity } from './project'

export interface TagEntity {
	id: string
	name: string
	slug: string
	projects?: ProjectEntity[]
}
