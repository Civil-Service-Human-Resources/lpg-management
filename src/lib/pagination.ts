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
}
