export interface GetOrganisationsRequestOptions {
	page: number
	size: number
	sort?: string
	ids?: string
}

export interface GetOrganisationRequestOptions {
	includeParents?: boolean
}
