import { FormattedOrganisation } from "./FormattedOrganisation";

export class FormattedOrganisationListResponse{
    constructor(
        public formattedOrganisationalUnitNames: FormattedOrganisation[]
    ) {}
}