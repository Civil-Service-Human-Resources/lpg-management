import { FormattedOrganisationListCache } from "src/csrs/formattedOrganisationListCache";
import { CslServiceClient } from "../client";
import { FormattedOrganisation } from "../model/FormattedOrganisation";
import { FormattedOrganisationListResponse } from "../model/FormattedOrganisationListResponse";
import { FormattedOrganisationList } from "../model/FormattedOrganisationList";

export class CslService {
    constructor(
        private formattedOrganisationListCache: FormattedOrganisationListCache,
        private cslClient: CslServiceClient) { }

    async getFormattedOrganisationList(uid: string, organisationIds: number[], domain: string): Promise<FormattedOrganisation[] | undefined> {
        let formattedOrganisationList = await this.formattedOrganisationListCache.get(uid)        

        if (!formattedOrganisationList) {
            const formattedOrganisationsResponse: FormattedOrganisationListResponse = await this.cslClient.getFormattedOrganisationList(organisationIds, domain)
            
            formattedOrganisationList = new FormattedOrganisationList(formattedOrganisationsResponse.formattedOrganisationalUnitNames)            
            await this.formattedOrganisationListCache.set(uid, formattedOrganisationList)

            
        }

        return formattedOrganisationList?.formattedOrganisationalUnitNames
    }
}
