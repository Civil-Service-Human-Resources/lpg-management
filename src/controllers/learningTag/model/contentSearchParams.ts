import {SearchQuery} from '../../models/searchQuery'
import {SearchParams} from '../../../lib/paginationService'
import {Transform} from 'class-transformer'
import {learningTagContentType} from '../learningTagController'

export abstract class ContentSearchParams extends SearchQuery implements SearchParams {
	@Transform(({obj, value}) => {
		const raw = value !== undefined ? value : obj?.p
		if (raw === undefined || raw === null || raw === '') {
			return 0
		}
		const num = +raw
		return isNaN(num) || num === 0 ? 0 : num - 1
	})
	page: number = 0

	constructor(public learningTagId: number) {
		super()
	}

	get p(): number {
		return this.page
	}

	set p(val: number) {
		this.page = val
	}

	abstract getContentType(): learningTagContentType

	getBaseUrl(): string {
		return `/content-management/learning-tags/${this.learningTagId}/${this.getContentType()}`
	}

	getUrlParts(page?: number): string[] {
		const urlParts = []
		const pageToUse = page !== undefined ? page : (this.page > 0 ? this.page + 1 : 1)
		if (pageToUse) {
			urlParts.push(`page=${pageToUse}`)
		}
		return urlParts
	}

	getAsUrlParams(page?: number): string {
		return `${this.getBaseUrl()}?` + this.getUrlParts(page).join('&')
	}
}