import {NextFunction, Request, Response} from 'express'
import {LearningCatalogue} from '../learning-catalogue'

import {PaginationService} from '../lib/paginationService'
import {DefaultPageResults} from 'src/learning-catalogue/model/defaultPageResults'
import {Course} from 'src/learning-catalogue/model/course'
import {plainToInstance} from 'class-transformer'
import {HomepagePageParams} from './models/homepagePageParams'

export class HomeController {
	learningCatalogue: LearningCatalogue
	pagination: PaginationService

	constructor(learningCatalogue: LearningCatalogue, pagination: PaginationService) {
		this.learningCatalogue = learningCatalogue
		this.pagination = pagination
	}

	public index() {
		return async (request: Request, response: Response, next: NextFunction) => {

			const params = plainToInstance(HomepagePageParams, request.query)

			try{
				const pageResults: DefaultPageResults<Course> = await this.learningCatalogue.listCourses(params.p)
				const pagePagination = this.pagination.getPagination(params, pageResults)

				response.render('page/index', {
					pageResults,
					pagePagination: pagePagination
				})
			}
			catch(error){
				if (error.response && error.response.status == 403) {
					response.render('page/index')
				} else {
					next(error)
				}
			}


		}
	}
}
