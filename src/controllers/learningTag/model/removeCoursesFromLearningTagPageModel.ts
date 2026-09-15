import {IsNotEmpty} from 'class-validator'
import {BasicCourse} from '../../../learning-catalogue/courseTypeAhead'
import {Transform} from 'class-transformer'
import {transformStringArray} from '../../../utils/transformUtils'
import {RemoveContentFromLearningTagPageModel} from './removeContentFromLearningTagPageModel'

export class RemoveCoursesFromLearningTagPageModel extends RemoveContentFromLearningTagPageModel<BasicCourse> {

	@IsNotEmpty({
		message: 'learningTags.validation.courses.emptySelection'
	})
	@Transform(transformStringArray)
	public ids: string[]

}