import { ArrayMaxSize, ValidateIf } from "class-validator";
import {REPORTING} from '../../../config'

export class SubmitOrganisationsModel{
    @ValidateIf(o => o.selectedOrganisations !== undefined)
    @ArrayMaxSize(REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS, {
        message: `You have chosen too many organisations. You can choose up to ${REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS} organisations`
    })
    public selectedOrganisations: {id: string, name: string}[] | undefined

    constructor(selectedOrganisations: {id: string, name: string}[] | undefined) {
        this.selectedOrganisations = selectedOrganisations
    }
}