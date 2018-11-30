import {Request, Response} from 'express'
import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {DefaultPageResults} from '../learning-catalogue/model/defaultPageResults'

import * as log4js from 'log4js'
import {Pagination} from 'lib/pagination'

export class HomeController {
	logger = log4js.getLogger('controllers/homeController')
	learningCatalogue: LearningCatalogue
	pagination: Pagination

	constructor(learningCatalogue: LearningCatalogue, pagination: Pagination) {
		this.learningCatalogue = learningCatalogue
		this.pagination = pagination
	}

	public index() {
		const self = this

		//TODO: Return empty list of results here if learning catalogue is down?
		return async (request: Request, response: Response) => {
			let {page, size} = this.pagination.getPageAndSizeFromRequest(request)

			// prettier-ignore
			const pageResults: DefaultPageResults<Course> = await self.learningCatalogue.listCourses(page, size)

			response.render('page/index', {
				pageResults,
			})
		}
	}
}
