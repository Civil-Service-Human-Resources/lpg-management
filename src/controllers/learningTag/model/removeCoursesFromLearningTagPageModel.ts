import {SubmittableForm} from '../../models/submittableForm'
import {IsNotEmpty} from 'class-validator'
import {PaginationPage} from '../../../lib/paginationService'
import {BasicCourse} from '../../../learning-catalogue/courseTypeAhead'
import {Transform} from 'class-transformer'
import {transformStringArray} from '../../../utils/transformUtils'

export class RemoveCoursesFromLearningTagPageModel extends SubmittableForm {

	public results?: BasicCourse[]
	public pagePagination?: PaginationPage

	@IsNotEmpty({
		message: 'learningTags.validation.courses.emptySelection'
	})
	@Transform(transformStringArray)
	public courseIds: string[]
	public allIds: string

	constructor(results?: BasicCourse[], pagePagination?: PaginationPage) {
		super()
		this.results = results
		this.pagePagination = pagePagination
		this.allIds = (results || []).map(c => c.id).join(",")
	}

	getCourseIds() {
		return (this.courseIds.length === 1 && this.courseIds[0] === 'all') ? this.allIds.split(",") : this.courseIds
	}

	setResults(results: BasicCourse[]) {
		this.results = results
		this.allIds = (results || []).map(c => c.id).join(",")
	}
}