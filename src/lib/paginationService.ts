export interface SearchResponse<T> {
	results: T[]
	page: number
	totalResults: number
	size: number
}

export interface SearchParams {
	getAsUrlParams(page?: number): string | undefined
}

export interface PaginationNumberedPage {
	number?: number
	url?: string
	ellipsis?: boolean
	current?: boolean
}

export interface Pagination { previous: { href: string } | undefined, next: { href: string } | undefined, items: PaginationNumberedPage[] }

export interface PaginationPage {
	pagination: Pagination,
	currentPage: number,
	totalPages: number,
	start: number,
	end: number,
	total: number
}

export class PaginationService {
	constructor() {}

	getPagination(params: SearchParams, searchResults: SearchResponse<any>): PaginationPage {
		let previous: {href: string} | undefined
		let next: {href: string} | undefined
		const items: PaginationNumberedPage[] = []
		let fePage = 1
		const pages = Math.ceil(searchResults.totalResults / searchResults.size)
		if (searchResults.totalResults > 0) {
			fePage = searchResults.page + 1
			if (fePage > 1) {
				const href = params.getAsUrlParams(fePage - 1)
				if (href) {
					previous = {href}
				}
			}
			let skip = false
			let skipped = false
			for (let i = 1; i <= pages; i++) {
				skip = i > 1 && Math.abs(i - fePage) > 1 && i !== pages
				if (skip && !skipped) {
					items.push({ellipsis: true})
					skipped = true
				}
				if (!skip) {
					skipped = false
					let link: string | undefined = params.getAsUrlParams(i)
					let item: PaginationNumberedPage = {url: link, number: i}
					if (i === fePage) {
						item.current = true
					}
					items.push(item)
				}
			}
			if (fePage !== pages) {
				const href = params.getAsUrlParams(fePage + 1)
				if (href) {
					next = {href}
				}
			}
		}
		return {
			pagination: {
				next,
				previous,
				items,
			},
			currentPage: fePage,
			totalPages: pages,
			start: searchResults.page * searchResults.size + 1,
			end: searchResults.page * searchResults.size + searchResults.results.length,
			total: searchResults.totalResults,
		}
	}
}
