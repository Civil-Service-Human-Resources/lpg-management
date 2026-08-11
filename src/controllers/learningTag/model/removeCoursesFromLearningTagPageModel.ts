import {SubmittableForm} from '../../models/submittableForm'

export class RemoveCoursesFromLearningTagPageModel extends SubmittableForm {
	courseIds: string[]


	constructor(courseIds: string[]) {
		super(undefined)
		this.courseIds = courseIds
	}
}