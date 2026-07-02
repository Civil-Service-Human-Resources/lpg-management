import {Type} from 'class-transformer'
import {FormattedTaxonomyItem} from '../../../../lib/taxonomy/formattedTaxonomyItem'

export class FormattedTaxonomyItemListResponse<T extends FormattedTaxonomyItem> {
	@Type(() => FormattedTaxonomyItem)
	public names: T[]

	constructor(names: T[]) {
		this.names = names
	}
}