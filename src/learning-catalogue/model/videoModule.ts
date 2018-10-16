import {Module} from './module'
import {IsNotEmpty, IsUrl} from 'class-validator'

export class VideoModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'url'],
		message: 'validation_module_url_empty',
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

	type: Module.Type.VIDEO
}
