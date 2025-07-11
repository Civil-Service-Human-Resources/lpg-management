import {REPORTING} from '../../../config'
import { FormattedOrganisation } from "src/csl-service/model/FormattedOrganisation"
import { OrganisationalUnit } from "src/csrs/model/organisationalUnit"

export class ChooseOrganisationsModel{
    // Settings:
    public showTypeaheadOption: boolean = false
    public showWholeCivilServiceOption: boolean = false
    public showMultipleOrganisationsOption: boolean = false
    public maxAllowedOrganisations: number = REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS

    // Data:
    public firstOrganisationOption: {id: string, name: string}
    public organisationListForTypeAhead: OrganisationalUnit[]
    public multipleOrganisationsOptions: FormattedOrganisation[]

    constructor(
        firstOrganisationOption: { id: string, name: string },
        organisationListForTypeAhead: OrganisationalUnit[],
        multipleOrganisationsOptions: FormattedOrganisation[]
    ) {
        this.firstOrganisationOption = firstOrganisationOption
        this.organisationListForTypeAhead = organisationListForTypeAhead
        this.multipleOrganisationsOptions = multipleOrganisationsOptions
    }
    
    
}