import {REPORTING} from '../../../config'
import { FormattedOrganisation } from "src/csl-service/model/FormattedOrganisation"
import {Exclude, Transform} from 'class-transformer'
import {ArrayMaxSize, ArrayMinSize, ValidateIf} from 'class-validator'

export type OrganisationSelection = 'allOrganisations' | 'multiple-organisations'

export class ChooseOrganisationsModel {

    // Settings:
    @Exclude()
    public showWholeCivilServiceOption: boolean = false
    @Exclude()
    public maxAllowedOrganisations: number = REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS

    // Data:
    @Exclude()
    public firstOrganisationOption: {id: string, name: string}
    @Exclude()
    public multipleOrganisationsOptions: FormattedOrganisation[]

    // Input attributes:
    public organisation: OrganisationSelection | number

    @ValidateIf(o => o.organisation === 'multiple-organisations')
    @ArrayMaxSize(REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS, {
        message: `You have chosen too many organisations. You can choose up to ${REPORTING.COURSE_COMPLETIONS_MAX_ORGANISATIONS} organisations`
    })
    @ArrayMinSize(1, {
        message: "Please choose at least one organisation before proceeding."
    })
    @Transform(({value}) => {
        if (typeof value === "string") {
            return [value]
        } else {
            return [...value]
        }
    })
    public organisationSearch: string[]


    constructor(
        firstOrganisationOption: { id: string, name: string },
        multipleOrganisationsOptions: FormattedOrganisation[]
    ) {
        this.firstOrganisationOption = firstOrganisationOption
        this.multipleOrganisationsOptions = multipleOrganisationsOptions
    }

    public getSelectedOrganisationIds(): number[] | undefined {
        if (!Number.isNaN(this.organisation)) {
            return [this.organisation as number]
        } else if (this.organisation == 'allOrganisations') {
            return undefined
        } else {
            return this.organisationSearch.map(parseInt)
        }
    }

}
