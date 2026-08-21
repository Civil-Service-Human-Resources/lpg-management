import {SearchParams} from '../../../lib/paginationService'
import {LearningTagCourseSearchParams} from './learningTagCourseSearchParams'

export class LearningTagHyperlinksSearchParams extends LearningTagCourseSearchParams implements SearchParams {

	getAsUrlParams(page?: number): string {
		return `${super.getBaseUrl()}?` + this.getUrlParts(page).join('&') + '#links'
	}

}
