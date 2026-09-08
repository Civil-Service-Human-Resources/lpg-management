import {IsNotEmpty} from 'class-validator'
import {Hyperlink} from '../../../learning-catalogue/model/learningTag/hyperlink'
import {Transform} from 'class-transformer'
import {transformStringArray} from '../../../utils/transformUtils'
import {RemoveContentFromLearningTagPageModel} from './removeContentFromLearningTagPageModel'

export class RemoveHyperlinksFromLearningTagPageModel extends RemoveContentFromLearningTagPageModel<Hyperlink> {

	@IsNotEmpty({
		message: 'learningTags.validation.hyperlinks.emptySelection'
	})
	@Transform(transformStringArray)
	public ids: string[]
}
