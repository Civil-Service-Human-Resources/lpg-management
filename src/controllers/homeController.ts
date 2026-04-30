import {NextFunction, Request, Response} from 'express'
import {LearningCatalogue} from '../learning-catalogue'

import {Pagination} from 'lib/pagination'
import { DefaultPageResults } from 'src/learning-catalogue/model/defaultPageResults'
import { Course } from 'src/learning-catalogue/model/course'

export class HomeController {
	learningCatalogue: LearningCatalogue
	pagination: Pagination

	constructor(learningCatalogue: LearningCatalogue, pagination: Pagination) {
		this.learningCatalogue = learningCatalogue
		this.pagination = pagination
	}

	public index() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let {page, size} = this.pagination.getPageAndSizeFromRequest(request)

			try{
				const pageResults: DefaultPageResults<Course> = await this.learningCatalogue.listCourses(page, size)

				const paginationUrlBase: string = `/content-management/?s=${size}&p=`
				const pagePagination = this.pagination.getPagination(Number(page) + 1, pageResults.getPageCount(), paginationUrlBase)

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
