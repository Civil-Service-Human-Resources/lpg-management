import {Module} from './module'
import {IsNotEmpty} from 'class-validator'

export class LinkModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'location'],
		message: 'validation.module.location.empty',
	})
	location: string
}
