import {SubmittableForm} from '../../models/submittableForm'
import {Exclude, Transform} from 'class-transformer'
import {FormattedTaxonomyItem} from '../../../lib/taxonomy/formattedTaxonomyItem'
import {ArrayMaxSize, IsNotEmpty} from 'class-validator'
import {transformStringArray} from '../../../utils/transformUtils'
import {LEARNING_TAGS} from '../../../config'

export class SearchForTagsModel extends SubmittableForm {

	// settings
	@Exclude()
	public maxTagsSelection: number = LEARNING_TAGS.ASSIGN_TAGS_MAX_TAGS

	// Data
	@Exclude()
	public tagsList: FormattedTaxonomyItem[]

	constructor(tagsList: FormattedTaxonomyItem[]) {
		super()
		this.tagsList = tagsList
	}

	// input
	@IsNotEmpty({
		message: 'learningTags.validation.assign.tagSearchSelection'
	})
	@ArrayMaxSize(LEARNING_TAGS.ASSIGN_TAGS_MAX_TAGS, {
		message: 'learningTags.validation.assign.maximumTags',
	})
	@Transform(transformStringArray)
	public tagSearch: string[]
}