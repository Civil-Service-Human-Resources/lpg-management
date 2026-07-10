import {IsNotEmpty, Matches, MaxLength, ValidateIf} from 'class-validator'
import {SubmittableForm} from '../../models/submittableForm'
import {Transform} from 'class-transformer'
import {FormattedTaxonomyItem} from '../../../lib/taxonomy/formattedTaxonomyItem'

export class LearningTagPageModel extends SubmittableForm {

	public id: number
	public parentTags: FormattedTaxonomyItem[]

	@IsNotEmpty({
		message: 'learningTags.validation.name.empty',
	})
	@Transform(({value}) => {
		return value.replaceAll("&amp;", "&").trim()
	})
	@MaxLength(50, {
		message: 'learningTags.validation.name.length',
	})
	name: string = ''

	@IsNotEmpty({
		message: 'learningTags.validation.code.empty',
	})
	@MaxLength(10, {
		message: 'learningTags.validation.code.length',
	})
	code: string = ''

	@MaxLength(255, {
		message: 'learningTags.validation.description.length',
	})
	@Transform(({value}) => {
		return value.replaceAll("&amp;", "&").trim()
	})
	description?: string = ''

	/**
	 * Undefined if no parent set. null if unlinking current parent
	 */
	parentId?: number | null

	@Transform(({value}) => {
		return value === "true" || value === true
	})
	category: boolean

	@Transform(({value}) => {
		if (value === '') {
			value = undefined
		}
		return value
	})
	@MaxLength(50, {
		message: 'learningTags.validation.urlSlug.length',
	})
	@Matches(RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$"),
	{
		message: 'learningTags.validation.urlSlug.valid',
	})
	@ValidateIf(object => {
		return object.urlSlug !== undefined
	})
	urlSlug?: string

	constructor(parentTags: FormattedTaxonomyItem[]) {
		super()
		this.parentTags = parentTags
	}

	validate() {
		const otherTags = this.parentTags.filter(f => f.id !== this.id)
		if (otherTags.map(f => f.name).includes(this.name)) {
			this.addError({name: ['learningTags.validation.name.alreadyExists']})
		}
		if (otherTags.map(f => f.code).includes(this.code)) {
			this.addError({code: ['learningTags.validation.code.alreadyExists']})
		}
		if (this.parentId === this.id) {
			this.addError({parentId: ['learningTags.validation.learningTag.selfReference']})
		}
	}
}
