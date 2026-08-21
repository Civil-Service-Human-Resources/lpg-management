import {SearchParams} from '../../../lib/paginationService'
import {LearningTagCourseSearchParams} from './learningTagCourseSearchParams'

export class LearningTagHyperlinksSearchParams extends LearningTagCourseSearchParams implements SearchParams {

	get p(): number {
		return this.linkPage
	}

	set p(val: number) {
		this.linkPage = val
	}

	getUrlParts(page?: number): string[] {
		const urlParts = []
		if (this.coursePage > 0) {
			urlParts.push(`coursePage=${this.coursePage + 1}`)
		}
		const linkPageToUse = page !== undefined ? page : (this.linkPage > 0 ? this.linkPage + 1 : 1)
		if (linkPageToUse) {
			urlParts.push(`linkPage=${linkPageToUse}`)
		}
		return urlParts
	}

	getAsUrlParams(page?: number): string {
		return `${this.getBaseUrl()}?` + this.getUrlParts(page).join('&') + '#links'
	}

}
