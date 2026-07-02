import {FormattedOrganisation} from './FormattedOrganisation'
import {Type} from 'class-transformer'
import {FormattedTaxonomyItemList} from '../../../lib/taxonomy/formattedTaxonomyItemList'

export class FormattedOrganisationList extends FormattedTaxonomyItemList<FormattedOrganisation> {

    @Type(() => FormattedOrganisation)
    public names: FormattedOrganisation[]

    constructor(id: string, names: FormattedOrganisation[]) {
        super(id, names)
    }
}
