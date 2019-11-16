import {Module} from './module'
import {IsNotEmpty, IsPositive} from 'class-validator'

export class FileModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'mediaId'],
		message: 'validation_module_mediaId_empty',
	})
	mediaId: string

	@IsNotEmpty({
		groups: ['all', 'fileSize'],
		message: 'validation_module_fileSize_empty',
	})
	@IsPositive({
		groups: ['all', 'fileSize'],
		message: 'validation_module_fileSize_positive',
	})
	fileSize: number

	type: Module.Type.FILE

	associatedLearning: boolean

	url: string
}
