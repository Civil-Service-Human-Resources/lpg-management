import { ArrayMaxSize, ArrayMinSize, ValidateIf } from "class-validator";
import {REPORTING} from '../../../config'

export class SubmitOrganisationsModel{
    @ValidateIf(o => o.selectedOrganisations !== undefined)
    @ArrayMaxSize(REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS, {
        message: `You have chosen too many organisations. You can choose up to ${REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS} organisations`
    })
    @ArrayMinSize(1, {
        message: "Please choose at least one organisation before proceeding."
    })
    public selectedOrganisations: {id: string, name: string}[] | undefined

    constructor(selectedOrganisations: {id: string, name: string}[] | undefined) {
        this.selectedOrganisations = selectedOrganisations
    }
}