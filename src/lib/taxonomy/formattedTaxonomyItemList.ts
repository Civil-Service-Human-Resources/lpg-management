import {CacheableObject} from '../cache/cacheableObject'
import {FormattedTaxonomyItem} from './formattedTaxonomyItem'

export class FormattedTaxonomyItemList<T extends FormattedTaxonomyItem> implements CacheableObject {
	protected _id: string
	public names: T[]

	constructor(id: string, formattedItems: T[]) {
		this._id = id
		this.names = formattedItems
	}

	getId(): string {
		return this._id
	}
}
