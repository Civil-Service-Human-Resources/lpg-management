import {Module} from './module'
import {IsNotEmpty} from 'class-validator'

export class LinkModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'title'],
		message: 'validation_module_title_empty',
	})
	title: string

	@IsNotEmpty({
		groups: ['all', 'description'],
		message: 'validation_module_description_empty',
	})
	description: string

	@IsNotEmpty({
		groups: ['all', 'url'],
		message: 'validation_module_blog_url_empty',
	})
	url: string

	@IsNotEmpty({
		groups: ['all', 'duration'],
		message: 'validation_module_duration_empty',
	})
	duration: number

	@IsNotEmpty({
		groups: ['all', 'duration'],
		message: 'validation_module_isOptional_empty',
	})
	isOptional: boolean

	type: 'link'
}
