import {LearningTagService} from '../../../learning-catalogue/service/learningTagService'
import {ContentSearchParams} from '../model/contentSearchParams'
import {PaginationService} from '../../../lib/paginationService'
import {LearningTagContentManagementControllerBase} from './learningTagContentManagementControllerBase'
import {BasicCourse} from '../../../learning-catalogue/courseTypeAhead'
import {LearningTagCoursesResponse} from '../../../learning-catalogue/model/learningTag/learningTagCoursesResponse'
import {RemoveCoursesFromLearningTagPageModel} from '../model/removeCoursesFromLearningTagPageModel'
import {LearningTagCourseSearchParams} from '../model/learningTagCourseSearchParams'
import {learningTagCourseManagerRole} from '../../../identity/identity'
import {createRouteCollection, RouteCollection} from '../../route'

export class LearningTagCourseManagementController extends LearningTagContentManagementControllerBase<BasicCourse> {

	constructor(learningTagService: LearningTagService, pagination: PaginationService) {
		super(learningTagService, 'courses', RemoveCoursesFromLearningTagPageModel,
			LearningTagCourseSearchParams, pagination)
	}

	protected getRouteCollections(): RouteCollection[] {
		return [
			createRouteCollection(this.getBaseRoutes(), [], learningTagCourseManagerRole)
		]
	}

	remove = async (learningTagId: number, ids: string[]): Promise<string> => {
		return await this.learningTagService.removeCourses(learningTagId, ids)
	}

	getResults = async (learningTagId: number, params: ContentSearchParams): Promise<LearningTagCoursesResponse> => {
		return await this.learningTagService.getCoursesPage(learningTagId, params)
	}

}
