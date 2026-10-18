import type { ProjectEntity } from '~/types/project'

export const getProjectFullName = (
	project: Pick<ProjectEntity, 'repositoryName' | 'owner'>
) =>
	project.owner?.login
		? `${project.owner.login}/${project.repositoryName}`
		: project.repositoryName

export const getProjectRepoUrl = (
	project: Pick<ProjectEntity, 'repositoryName' | 'owner'>
) => `https://github.com/${getProjectFullName(project)}`
