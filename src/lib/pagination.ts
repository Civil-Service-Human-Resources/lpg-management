import {Request} from 'express'

export class Pagination {
	constructor() {}
	public getPageAndSizeFromRequest(request: Request) {
		let page = 0
		let size = 10

		if (request.query.p) {
			// @ts-ignore
			page = request.query.p
		}
		if (request.query.s) {
			// @ts-ignore
			size = request.query.s
		}
		return {page, size}
	}

	public getPagination(currentPage: number, totalPages: number, urlBase: string) {		
		const previousPage: number | null = currentPage == 1 ? null : currentPage - 1
		const nextPage: number | null = currentPage == totalPages ? null : Number(currentPage) + 1

		const pagination: { previous: { href: string } | null, next: { href: string } | null, items: any[] } = {
			previous: previousPage !== null ? { href: `${urlBase}${(previousPage-1)}` } : null,
			next: nextPage !== null ? { href: `${urlBase}${(nextPage-1)}` } : null,
			items: []
		}

		pagination.items.push({
			number: 1,
			url: `${urlBase}0`
		})		

		if(totalPages === 1){
			pagination.items[0].current = true
			return pagination
		}

		if (currentPage > 3) {
			pagination.items.push({
				ellipsis: true
			})
		}		

		for (let i = currentPage - 1; i <= currentPage + 1; i++) {
			if (i > 1 && i < totalPages) {
				pagination.items.push({
					number: i,
					url: `${urlBase}${i - 1}`
				})
			}
		}		

		if (currentPage <= totalPages - 2) {
			pagination.items.push({
				ellipsis: true
			})
		}		

		pagination.items.push({
			number: totalPages,
			url: `${urlBase}${totalPages - 1}`
		})				
	
		pagination.items.find(item => item.number == currentPage).current = true				

		return pagination
	}
}
