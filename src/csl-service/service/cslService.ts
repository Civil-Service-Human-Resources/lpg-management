import { FormattedOrganisationListCache } from "src/csrs/formattedOrganisationListCache";
import { CslServiceClient } from "../client";
import { FormattedOrganisationList } from "../model/FormattedOrganisationList";
import {GetOrganisationsFormattedParams} from '../model/getOrganisationsFormattedParams'

export class CslService {
    constructor(
        private formattedOrganisationListCache: FormattedOrganisationListCache,
        private cslClient: CslServiceClient) { }

    async getOrganisationTypeaheadForUser(user: any) {
        let params = new GetOrganisationsFormattedParams()
        if (!user.isUnrestrictedOrgUser()) {
            params = new GetOrganisationsFormattedParams(user.getDomain(), user.getOtherOrganisationIds())
        }
        const cacheKey = params.getCacheKey()
        let typeahead = await this.formattedOrganisationListCache.get(cacheKey)
        if (typeahead === undefined) {
            const formattedOrganisations = await this.cslClient.getFormattedOrganisationList(params)
            typeahead = new FormattedOrganisationList(cacheKey, formattedOrganisations.formattedOrganisationalUnitNames)
            await this.formattedOrganisationListCache.set(cacheKey, typeahead)
        }
        return typeahead.formattedOrganisations
    }
}
