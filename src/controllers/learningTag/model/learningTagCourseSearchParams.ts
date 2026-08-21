import {SearchParams} from '../../../lib/paginationService'
import {SearchQuery} from '../../models/searchQuery'

export class LearningTagCourseSearchParams extends SearchQuery implements SearchParams {

	constructor(public learningTagId: number) {
		super()
	}

	getBaseUrl(): string {
		return `/content-management/learning-tags/${this.learningTagId}/courses`
	}

	getAsUrlParams(page?: number): string {
		return `${super.getAsUrlParams(page)}#courses`
	}

}