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
	coursePage: number = 0

	constructor(public learningTagId: number) {
		super()
	}

	get p(): number {
		return this.coursePage
	}

	set p(val: number) {
		this.coursePage = val
	}

	abstract getContentType(): learningTagContentType

	getBaseUrl(): string {
		return `/content-management/learning-tags/${this.learningTagId}/${this.getContentType()}`
	}

	getUrlParts(page?: number): string[] {
		const urlParts = []
		const coursePageToUse = page !== undefined ? page : (this.coursePage > 0 ? this.coursePage + 1 : 1)
		if (coursePageToUse) {
			urlParts.push(`coursePage=${coursePageToUse}`)
		}
		return urlParts
	}

	getAsUrlParams(page?: number): string {
		return `${this.getBaseUrl()}?` + this.getUrlParts(page).join('&')
	}
}