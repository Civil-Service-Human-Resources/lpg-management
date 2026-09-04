import {Transform} from 'class-transformer'
import {SearchParams} from '../../../lib/paginationService'
import {SearchQuery} from '../../models/searchQuery'

export class LearningTagHyperlinksSearchParams extends SearchQuery implements SearchParams {

	@Transform(({obj, value}) => {
		const raw = value !== undefined ? value : obj?.p
		if (raw === undefined || raw === null || raw === '') {
			return 0
		}
		const num = +raw
		return isNaN(num) || num === 0 ? 0 : num - 1
	})
	linkPage: number = 0

	constructor(public learningTagId: number) {
		super()
	}

	get p(): number {
		return this.linkPage
	}

	set p(val: number) {
		this.linkPage = val
	}

	getBaseUrl(): string {
		return `/content-management/learning-tags/${this.learningTagId}/courses`
	}

	getUrlParts(page?: number): string[] {
		const urlParts = []
		const linkPageToUse = page !== undefined ? page : (this.linkPage > 0 ? this.linkPage + 1 : 1)
		if (linkPageToUse) {
			urlParts.push(`linkPage=${linkPageToUse}`)
		}
		return urlParts
	}

	getAsUrlParams(page?: number): string {
		return `${this.getBaseUrl()}?` + this.getUrlParts(page).join('&')
	}

}
