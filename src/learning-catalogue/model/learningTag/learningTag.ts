import * as config from '../../../config'
import {NSG_BASE_URL} from '../../../config'
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
	@Transform(({obj}) => {
		return `${config.FRONTEND.LPG_UI_URL}${NSG_BASE_URL}/categories/${obj.urlSlug}`
	})
	@Expose()
	lpgUiUrl: string
	parentId?: number
	parentName?: string
	category: boolean
	archived: boolean

}