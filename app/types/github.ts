// subset of the github rest repo object returned by get /github/repositories
export interface GithubRepository {
	id: number
	name: string
	full_name: string
	html_url: string
	private: boolean
	description: string | null
	owner: { login: string }
}
