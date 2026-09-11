import {Transform} from 'class-transformer'
import * as striptags from 'striptags'
import {SearchParams} from '../../lib/paginationService'

export class SearchQuery implements SearchParams {
	private _p: number = 0

	@Transform(({value}) => {
		value = +value
		return value == 0 ? value : value-1
	})
	get p(): number {
		return this._p
	}

	set p(value: number) {
		this._p = value
	}

	@Transform(({value}) => {
		return striptags(value)
	})
	q: string = ''

	getBaseUrl(): string {
		return '/content-management/search'
	}

	getUrlParts(page?: number): string[] {
		const urlParts = []
		if (this.q !== '') {
			urlParts.push(`q=${this.q}`)
		}
		if (page) {
			urlParts.push(`p=${page}`)
		}
		return urlParts
	}

	getAsUrlParams(page?: number) {
		return `${this.getBaseUrl()}?` + this.getUrlParts(page).join('&')
	}
}