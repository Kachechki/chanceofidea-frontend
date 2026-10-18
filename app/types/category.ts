export interface CategoryEntity {
	id: string
	name: string
	slug: string
}

// Backend row that means "no category filter". It is not a real category for projects.
export const ALL_CATEGORY_ID = '952a04fb-6e46-408e-a785-67efb1bf7970'
