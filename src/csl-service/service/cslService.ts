import { FormattedOrganisationListCache } from "src/csrs/formattedOrganisationListCache";
import { CslServiceClient } from "../client";
import { FormattedOrganisationList } from "../model/FormattedOrganisationList";
import {GetOrganisationsFormattedParams} from '../model/getOrganisationsFormattedParams'
import {OrganisationalUnit} from '../../csrs/model/organisationalUnit'

export class CslService {
    constructor(
        private formattedOrganisationListCache: FormattedOrganisationListCache,
        private cslClient: CslServiceClient) { }

    async getOrganisationTypeaheadForUser(user: any) {
        let params = new GetOrganisationsFormattedParams()
        if (!user.isUnrestrictedOrganisation()) {
            params = new GetOrganisationsFormattedParams(user.getDomain(), user.otherOrganisationalUnits.map((o: OrganisationalUnit) => {
                return o.id
            }))
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
