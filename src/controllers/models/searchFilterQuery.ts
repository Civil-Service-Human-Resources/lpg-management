import {SearchQuery} from './searchQuery'
import {Transform} from 'class-transformer'
import {stringToArrayTransformer} from './utils'
import {costType, statusType, typesType, visibilityType} from '../../learning-catalogue/model/search/courseSearchParams'

export class SearchFilterQuery extends SearchQuery {
	@Transform(stringToArrayTransformer())
	courseType: typesType[] = []

	@Transform(stringToArrayTransformer())
	status: statusType[] = []

	@Transform(stringToArrayTransformer())
	visibility: visibilityType[] = []

	cost?: costType

	getUrlParts(page?: number): string[] {
		const urlParts = super.getUrlParts(page)
		this.courseType.forEach(courseType => {
			urlParts.push(`courseType=${courseType}`)
		})
		this.status.forEach(status => {
			urlParts.push(`status=${status}`)
		})
		this.visibility.forEach(visibility => {
			urlParts.push(`visibility=${visibility}`)
		})
		if (this.cost) {
			urlParts.push(`cost=${this.cost}`)
		}
		return urlParts
	}

}