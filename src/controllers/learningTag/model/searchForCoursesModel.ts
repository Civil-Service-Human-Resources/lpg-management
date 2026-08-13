import {SubmittableForm} from '../../models/submittableForm'
import {ArrayMaxSize, IsNotEmpty} from 'class-validator'
import {Exclude, Transform} from 'class-transformer'
import {BasicCourse} from '../../../learning-catalogue/courseTypeAhead'
import {transformStringArray} from '../../../utils/transformUtils'
import {LEARNING_TAGS} from '../../../config'

export class SearchForCoursesModel extends SubmittableForm {

	// settings
	@Exclude()
	public maxCoursesSelection: number = LEARNING_TAGS.ASSIGN_COURSES_MAX_COURSES

	@Exclude()
	public courseList: BasicCourse[]

	constructor(courseList: BasicCourse[]) {
		super()
		this.courseList = courseList
	}

	@IsNotEmpty({
		message: 'learningTags.validation.assign.courseSearchSelection'
	})
	@ArrayMaxSize(LEARNING_TAGS.ASSIGN_COURSES_MAX_COURSES, {
		message: 'learningTags.validation.assign.maximumCourses',
	})
	@Transform(transformStringArray)
	public courseSearch: string[]

}