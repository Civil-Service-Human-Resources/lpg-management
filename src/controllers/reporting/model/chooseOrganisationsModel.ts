import {REPORTING} from '../../../config'
import { FormattedOrganisation } from "src/csl-service/model/FormattedOrganisation"

export class ChooseOrganisationsModel{
    // Settings:
    public showWholeCivilServiceOption: boolean = false
    public showMultipleOrganisationsOption: boolean = false
    public maxAllowedOrganisations: number = REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS

    // Data:
    public firstOrganisationOption: {id: string, name: string}
    public multipleOrganisationsOptions: FormattedOrganisation[]

    constructor(
        firstOrganisationOption: { id: string, name: string },
        multipleOrganisationsOptions: FormattedOrganisation[]
    ) {
        this.firstOrganisationOption = firstOrganisationOption
        this.multipleOrganisationsOptions = multipleOrganisationsOptions
    }
    
    
}