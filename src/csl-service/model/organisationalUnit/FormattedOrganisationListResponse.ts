import {FormattedOrganisation} from './FormattedOrganisation'
import {Type} from 'class-transformer'

export class FormattedOrganisationListResponse{
    @Type(() => FormattedOrganisation)
    public names: FormattedOrganisation[]

    constructor(names: FormattedOrganisation[]) {
        this.names = names
    }
}
