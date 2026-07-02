import {FormattedTaxonomyItem} from '../../../lib/taxonomy/formattedTaxonomyItem'

export class FormattedOrganisation extends FormattedTaxonomyItem {
    public code: string
    public abbreviation: string = ''

    constructor(id: number, name: string, code: string, abbreviation: string) {
        super(id, name)
        this.code = code
        this.abbreviation = abbreviation
    }

    getAbbreviationOrName() {
        let orgNameOrAbbreviation = this.abbreviation
        if (orgNameOrAbbreviation === null || orgNameOrAbbreviation === '') {
            orgNameOrAbbreviation = this.getName()
        }
        return orgNameOrAbbreviation
    }
}
