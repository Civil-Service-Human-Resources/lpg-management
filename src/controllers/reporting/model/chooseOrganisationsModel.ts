import {REPORTING} from '../../../config'
import { FormattedOrganisation } from "src/csl-service/model/FormattedOrganisation"
import {Exclude, Transform} from 'class-transformer'
import {ArrayMaxSize, ArrayMinSize, ValidateIf} from 'class-validator'
import {SubmittableForm} from '../../models/submittableForm'

export type OrganisationSelection = 'allOrganisations' | 'multiple-organisations'

export class ChooseOrganisationsModel extends SubmittableForm {

    // Settings:
    @Exclude()
    public showWholeCivilServiceOption: boolean = false
    @Exclude()
    public maxAllowedOrganisations: number = REPORTING.REPORTING_MAX_ORGANISATIONS

    // Data:
    @Exclude()
    public firstOrganisationOption: {id: string, name: string}
    @Exclude()
    public multipleOrganisationsOptions: FormattedOrganisation[]

    // Input attributes:
    @Transform(({value}) => {
        if (!["allOrganisations", "multiple-organisations"].includes(value)) {
            return parseInt(value)
        } else {
            return value
        }
    })
    public organisation: OrganisationSelection | number | undefined

    @ValidateIf(o => o.organisation === 'multiple-organisations')
    @ArrayMaxSize(REPORTING.REPORTING_MAX_ORGANISATIONS, {
        message: "reporting.validation.organisations.tooManyOrganisations"
    })
    @ArrayMinSize(1, {
        message: "reporting.validation.organisations.minimumOrganisations"
    })
    @Transform(({value}) => {
        if (typeof value === "string") {
            return [value]
        } else {
            return [...(value as string[]).map(orgId => parseInt(orgId))]
        }
    })
    public organisationSearch: number[]

    constructor(
        firstOrganisationOption: { id: string, name: string },
        multipleOrganisationsOptions: FormattedOrganisation[]
    ) {
        super()
        this.firstOrganisationOption = firstOrganisationOption
        this.multipleOrganisationsOptions = multipleOrganisationsOptions
    }

    public getSelectedOrganisationIds(): number[] | undefined {
        if (this.organisation == 'multiple-organisations') {
            return this.organisationSearch
        } else if (this.organisation == 'allOrganisations') {
            return undefined
        } else {
            return this.organisation ? [this.organisation] : []
        }
    }
}
