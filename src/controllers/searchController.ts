import {Request, Response, Router} from 'express'
import {plainToInstance} from 'class-transformer'
import {SearchService} from '../learning-catalogue/service/searchService'
import {SearchFilterQuery} from './models/searchFilterQuery'

const { xss } = require('express-xss-sanitizer')


export class SearchController {
	router: Router
	service: SearchService

	constructor(service: SearchService) {
		this.service = service
		this.router = Router()
		this.configureRouterPaths()
	}

	private configureRouterPaths() {
		this.router.get('/content-management/search', xss(), this.searchCourses())
	}

	searchCourses() {
		return async (request: Request, response: Response) => {
			const params = plainToInstance(SearchFilterQuery, request.query)
			const pageModel = await this.service.searchForCourses(params, request)
			response.render('page/search-results.njk', {pageModel})
		}
	}
}
