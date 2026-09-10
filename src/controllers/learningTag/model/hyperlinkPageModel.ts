import {SubmittableForm} from '../../models/submittableForm'
import {IsNotEmpty, IsUrl, MaxLength} from 'class-validator'
import {Transform} from 'class-transformer'
import {Hyperlink} from '../../../learning-catalogue/model/learningTag/hyperlink'

export class HyperlinkPageModel extends SubmittableForm{

	@Transform(({value}) => {
		return value.replaceAll("&amp;", "&").trim()
	})
	@MaxLength(50, {
		message: 'learningTags.validation.hyperlinks.nameLength',
	})
	@IsNotEmpty({
		message: 'learningTags.validation.hyperlinks.emptyTitle'
	})
	title: string

	description: string


	@IsUrl({
		protocols: ['https'],
		require_protocol: true,
		require_valid_protocol: true,
		allow_trailing_dot: false,
	}, {
		message: 'learningTags.validation.hyperlinks.validUrl'
	})
	@IsNotEmpty({
		message: 'learningTags.validation.hyperlinks.emptyUrl'
	})
	url: string


	constructor(title: string, description: string, url: string) {
		super()
		this.title = title
		this.description = description
		this.url = url
	}

	validate(existingHyperlinks: Hyperlink[] = [], currentHyperlinkId?: number) {
		const otherLinks = existingHyperlinks.filter(f => f.id !== currentHyperlinkId)
		if (otherLinks.map(f => f.title).includes(this.title)) {
			this.addError({title: ['learningTags.validation.hyperlinks.titleAlreadyExists']})
		}
		if (otherLinks.map(f => f.url || f.href).includes(this.url)) {
			this.addError({url: ['learningTags.validation.hyperlinks.urlAlreadyExists']})
		}
	}
}