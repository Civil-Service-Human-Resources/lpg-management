import {Request} from 'express'

export class Pagination {
	constructor() {}

	public getPageAndSizeFromRequest(request: Request) {
		let page = 0
		let size = 10

		if (request.query.p) {
			page = request.query.p
		}
		if (request.query.s) {
			size = request.query.s
		}
		return {page, size}
	}
}
