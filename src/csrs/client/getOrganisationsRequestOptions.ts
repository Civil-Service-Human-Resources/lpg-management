export interface GetOrganisationsRequestOptions {
    /**
     * comma-separated organisational unit ids, leave blank to
     * fetch all.
     */
    ids?: string
    includeFormattedName: boolean
}