import {Module} from './module'
import {IsNotEmpty} from 'class-validator'

export class VideoModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'url'],
		message: 'validation_module_url_empty',
	})
	url: string

	@IsNotEmpty({
		groups: ['all', 'mediaID'],
		message: 'validation_module_mediaId_empty',
	})
	mediaId: string

	type: Module.Type.VIDEO
}
