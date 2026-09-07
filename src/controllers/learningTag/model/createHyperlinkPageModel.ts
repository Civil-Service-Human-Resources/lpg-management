import {SubmittableForm} from '../../models/submittableForm'
import {IsNotEmpty, IsUrl, MaxLength} from 'class-validator'
import {Transform} from 'class-transformer'

export class CreateHyperlinkPageModel extends SubmittableForm{

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

}