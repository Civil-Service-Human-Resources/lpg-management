import {Request, Response, Router} from 'express'
import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {DefaultPageResults} from '../learning-catalogue/model/defaultPageResults'
import {PaginationService} from '../lib/paginationService'
import {plainToInstance} from 'class-transformer'
import {SearchQuery} from './models/searchQuery'

const { xss } = require('express-xss-sanitizer')


export class SearchController {
	router: Router
	learningCatalogue: LearningCatalogue
	pagination: PaginationService

	constructor(learningCatalogue: LearningCatalogue, pagination: PaginationService) {
		this.learningCatalogue = learningCatalogue
		this.pagination = pagination
		this.router = Router()
		this.configureRouterPaths()
	}

	private configureRouterPaths() {
		this.router.get('/content-management/search', xss(), this.searchCourses())
	}

	searchCourses() {
		const self = this

		return async (request: Request, response: Response) => {
			const params = plainToInstance(SearchQuery, request.query)
			const pageResults: DefaultPageResults<Course> = await self.learningCatalogue.searchCourses(params.q, params.p, params.s)
			const pagePagination = this.pagination.getPagination(params, pageResults)

			response.render('page/search-results.njk', {
				pageResults: pageResults,
				query: params.q,
				pagePagination
			})
		}
	}
}
