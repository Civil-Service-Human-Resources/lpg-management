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
	href?: string
	ellipsis?: boolean
	current?: boolean
}

export interface Pagination {
	start: number
	end: number
	total: number
	currentPage: number
	totalPages: number
	prevLink?: string
	nextLink?: string
	numberedPages: PaginationNumberedPage[]
}

export class PaginationService {
	constructor() {}


	getPagination(params: SearchParams, searchResults: SearchResponse<any>): Pagination {
		let prevLink: string | undefined
		let nextLink: string | undefined
		const numberedPages: PaginationNumberedPage[] = []
		let fePage = 1
		const pages = Math.ceil(searchResults.totalResults / searchResults.size)
		if (searchResults.totalResults > 0) {
			fePage = searchResults.page + 1
			if (fePage > 1) {
				prevLink = params.getAsUrlParams(fePage - 1)
			}
			if (pages > 1) {
				let skip = false
				let skipped = false
				for (let i = 1; i <= pages; i++) {
					skip = i > 1 && Math.abs(i - fePage) > 1 && i !== pages
					if (skip && !skipped) {
						numberedPages.push({ellipsis: true})
						skipped = true
					}
					if (!skip) {
						skipped = false
						let link: string | undefined
						if (i !== fePage) {
							link = params.getAsUrlParams(i)
						}
						numberedPages.push({current: link === undefined, number: i, href: link})
					}
				}
			}

			if (fePage !== pages) {
				nextLink = params.getAsUrlParams(fePage + 1)
			}
		}
		return {
			nextLink,
			prevLink,
			numberedPages,
			currentPage: fePage,
			totalPages: pages,
			start: searchResults.page * searchResults.size + 1,
			end: searchResults.page * searchResults.size + searchResults.results.length,
			total: searchResults.totalResults,
		}
	}
}
