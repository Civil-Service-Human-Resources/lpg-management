import {SubmittableForm} from '../../models/submittableForm'
import {Exclude} from 'class-transformer'
import {FormattedTaxonomyItem} from '../../../lib/taxonomy/formattedTaxonomyItem'
import {IsNotEmpty} from 'class-validator'

export class SearchForTagModel extends SubmittableForm {

	// Data
	@Exclude()
	public tagsList: FormattedTaxonomyItem[]

	constructor(tagsList: FormattedTaxonomyItem[]) {
		super()
		this.tagsList = tagsList
	}

	// input
	@IsNotEmpty({
		message: 'learningTags.validation.assign.tagSelection'
	})
	public tagSelect: string
}