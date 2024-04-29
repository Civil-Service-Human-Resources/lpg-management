import {CourseCompletionsControllerBaseBase} from './courseCompletionsControllerBase'
import {getRequest, Route} from '../route'
import {Request, Response} from 'express'
import {ReportService} from '../../report-service'

export class CourseCompletionsController extends CourseCompletionsControllerBaseBase {

	constructor(
		protected reportService: ReportService,
	) {
		super('CourseCompletionsController', reportService)
	}

	protected getRoutes(): Route[] {
		return [
			getRequest('/choose-courses', this.renderChooseCourses())
		]
	}

	public renderChooseCourses() {
		return async (request: Request, response: Response) => {
			const pageModel = await this.reportService.getChooseCoursePage()
			response.render('page/reporting/choose-courses', {pageModel})
		}
	}
}
