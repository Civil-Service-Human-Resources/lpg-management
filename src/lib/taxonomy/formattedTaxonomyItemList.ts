import {CacheableObject} from '../cache/cacheableObject'
import {FormattedTaxonomyItem} from './formattedTaxonomyItem'
import {Type} from 'class-transformer'

export class FormattedTaxonomyItemList<T extends FormattedTaxonomyItem> implements CacheableObject {
	protected _id: string
	@Type(() => FormattedTaxonomyItem)
	public names: FormattedTaxonomyItem[]

	constructor(id: string, formattedItems: T[]) {
		this._id = id
		this.names = formattedItems
	}

	getId(): string {
		return this._id
	}
}
