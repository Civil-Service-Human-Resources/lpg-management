import * as config from '../../../config'
import {Expose, Transform} from 'class-transformer'
import {CachedTaxonomyItem} from '../../../lib/taxonomy/cachedTaxonomyItem'

export class LearningTag implements CachedTaxonomyItem {
	getId(): string {
		return this.id.toString()
	}

	id: number
	name: string
	description?: string
	code: string
	urlSlug: string
	fullUrl: string
	@Transform(({obj}) => {
		return `${config.FRONTEND.LPG_UI_URL}/categories/${obj.fullUrl}`
	})
	@Expose()
	lpgUiUrl: string
	parentId?: number
	parentName?: string
	category: boolean
	archived: boolean

}