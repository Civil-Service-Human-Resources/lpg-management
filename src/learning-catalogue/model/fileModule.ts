import {Module} from './module'
import {IsNotEmpty, IsPositive} from 'class-validator'

export class FileModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'url'],
		message: 'validation.module.url.empty',
	})
	url: string

	@IsNotEmpty({
		groups: ['all', 'fileSize'],
		message: 'validation.module.fileSize.empty',
	})
	@IsPositive({
		groups: ['all', 'fileSize'],
		message: 'validation.module.fileSize.positive',
	})
	fileSize: number

	type: Module.Type.FILE
}
