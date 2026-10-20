// shared form rules. the backend re-validates everything. these give fast, consistent feedback.

export const LIMITS = {
	title: 100,
	description: 5000,
	whyMe: 1000,
	actionPlan: 2000,
	rejectReason: 500,
	url: 300,
} as const

export type FieldErrors<K extends string> = Partial<Record<K, string>>

const REPO_NAME = /^[A-Za-z0-9._-]{1,100}$/
const REPO_OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/

export interface ParsedRepo {
	owner: string | null
	name: string
}

const toRepo = (owner: string | null, rawName: string): ParsedRepo | null => {
	const name = rawName.replace(/\.git$/i, '')
	if (!REPO_NAME.test(name) || name === '.' || name === '..') return null
	if (owner !== null && !REPO_OWNER.test(owner)) return null
	return { owner, name }
}

// accepts "repo", "owner/repo", "https://github.com/owner/repo.git",
// "github.com/owner/repo/tree/main" and "git@github.com:owner/repo.git"
export const parseRepoInput = (input: string): ParsedRepo | null => {
	const value = input.trim()
	if (!value) return null

	const urlMatch = value.match(/github\.com[/:](.+)$/i)
	const path =
		(urlMatch && urlMatch[1] ? urlMatch[1] : value).split(/[?#]/)[0] ?? ''
	const segments = path.split('/').filter(Boolean)

	if (urlMatch) {
		const [owner, name] = segments
		return owner && name ? toRepo(owner, name) : null
	}
	if (segments.length === 1) return toRepo(null, segments[0] ?? '')
	if (segments.length === 2) return toRepo(segments[0] ?? '', segments[1] ?? '')
	return null
}

export const isHttpUrl = (value: string) => {
	try {
		const { protocol } = new URL(value.trim())
		return protocol === 'https:' || protocol === 'http:'
	} catch {
		return false
	}
}

// a custom message replaces the default "{label} is required", for questions read as sentences
export const validateText = (
	value: string,
	label: string,
	max: number,
	requiredMessage = `${label} is required`
) => {
	const length = value.trim().length
	if (!length) return requiredMessage
	if (length > max) return `${label} must be ${max} characters or less`
	return ''
}

export const validateUrl = (value: string, label: string, required = false) => {
	const url = value.trim()
	if (!url) return required ? `${label} is required` : ''
	if (url.length > LIMITS.url)
		return `${label} must be ${LIMITS.url} characters or less`
	return isHttpUrl(url) ? '' : `${label} must be a valid http or https link`
}

export const validateRepository = (
	value: string,
	ownerLogin?: string | null
) => {
	if (!value.trim()) return 'Repository is required'

	const parsed = parseRepoInput(value)
	if (!parsed)
		return 'Enter a repository name or a GitHub URL like github.com/owner/repo'

	if (
		parsed.owner &&
		ownerLogin &&
		parsed.owner.toLowerCase() !== ownerLogin.toLowerCase()
	) {
		return `Repository must belong to @${ownerLogin}`
	}
	return ''
}

export const validateTerms = (accepted: boolean) =>
	accepted ? '' : 'You must accept the transfer terms'

export const hasErrors = (errors: Record<string, string | undefined>) =>
	Object.values(errors).some(Boolean)

// moves focus to the first field marked aria-invalid, so keyboard users land on the problem
export const focusFirstInvalid = () => {
	if (typeof document === 'undefined') return
	document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}

export interface ProjectFormValues {
	title: string
	repository?: string
	description: string
	categoryId: string
	tags: string[]
	figmaUrl?: string
	demoUrl?: string
}

export type ProjectFormErrors = FieldErrors<keyof ProjectFormValues>

// repository is only checked when it is part of the form (create), not on edit
export const validateProjectForm = (
	values: ProjectFormValues,
	ownerLogin?: string | null
): ProjectFormErrors => {
	const errors: ProjectFormErrors = {
		title: validateText(values.title, 'Title', LIMITS.title),
		description: validateText(
			values.description,
			'Description',
			LIMITS.description
		),
		categoryId: values.categoryId ? '' : 'Category is required',
		tags: values.tags.length > 0 ? '' : 'At least one tag is required',
		figmaUrl: validateUrl(values.figmaUrl ?? '', 'Figma URL'),
		demoUrl: validateUrl(values.demoUrl ?? '', 'Demo video URL'),
	}
	if (values.repository !== undefined) {
		errors.repository = validateRepository(values.repository, ownerLogin)
	}
	return errors
}
