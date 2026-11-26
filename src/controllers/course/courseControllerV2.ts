import {Controller} from '../controller'
import {CslServiceClient} from '../../csl-service/client'
import {createRouteCollection, getRequest, RouteCollection} from '../route'
import {learningEditRole, learningViewingRole} from '../../identity/identity'
import {Request, Response} from 'express'

export class CourseControllerV2 extends Controller{

	constructor(private cslService: CslServiceClient) {
		super('/content-management/courses', 'courseController')
		this.cslService = cslService
	}

	protected getRouteCollections(): RouteCollection[] {
		const viewEndpoints = createRouteCollection([
			getRequest('/:courseId/overview', this.courseOverview)
		], [], learningViewingRole)

		const editEndpoints = createRouteCollection([
			getRequest('/:courseId/preview', this.coursePreview)
		], [], learningEditRole)

		return [
			viewEndpoints,
			editEndpoints
		]
	}

	private async getOverview(req: Request, res: Response) {
		return await this.cslService.getCourseOverview(req.params['courseIdParam'])
	}

	courseOverview() {
		return async (req: Request, res: Response) => {
			const course = await this.getOverview(req, res)
			res.render('page/course/course-overview.njk', {course})
		}
	}

	coursePreview() {
		return async (req: Request, res: Response) => {
			const course = await this.getOverview(req, res)
			res.render('page/course/course-preview.njk', {course})
		}
	}

}