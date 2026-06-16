import * as config from '../../../config'
import {CacheableObject} from 'lib/cache/cacheableObject'
import {Expose, Transform} from 'class-transformer'

export class LearningTag implements CacheableObject {
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
	categoryTag: boolean
	archived: boolean

}