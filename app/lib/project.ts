import type { ProjectEntity } from '~/types/project'

// Full repo name, e.g. "alexdev/walkman-firmware"
export const getProjectFullName = (
	project: Pick<ProjectEntity, 'repositoryName' | 'owner'>
) =>
	project.owner?.login
		? `${project.owner.login}/${project.repositoryName}`
		: project.repositoryName

export const getProjectRepoUrl = (
	project: Pick<ProjectEntity, 'repositoryName' | 'owner'>
) => `https://github.com/${getProjectFullName(project)}`
