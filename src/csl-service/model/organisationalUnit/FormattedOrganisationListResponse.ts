import { FormattedOrganisation } from "./FormattedOrganisation";
import {Type} from 'class-transformer'

export class FormattedOrganisationListResponse{
    @Type(() => FormattedOrganisation)
    public formattedOrganisationalUnitNames: FormattedOrganisation[]

    constructor(formattedOrganisationalUnitNames: FormattedOrganisation[]) {
        this.formattedOrganisationalUnitNames = formattedOrganisationalUnitNames
    }
}
