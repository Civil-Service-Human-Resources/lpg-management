import {Module} from './module'
import {IsNotEmpty, IsUrl} from 'class-validator'

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
	@IsUrl({
		require_protocol: true,
		require_tld: true,
		allow_underscores: true,
		allow_trailing_dot: false
	},{
		groups: ['all', 'url'],
		message: 'validation_module_url_invalid',
	})
	url: string

	@IsNotEmpty({
		groups: ['all', 'duration'],
		message: 'validation.module.duration.empty',
	})
	duration: number

	isOptional: boolean

	type: Module.Type.LINK
}
