import {Module} from './module'
import {Event} from './event'
import {IsNotEmpty, ValidateNested} from 'class-validator'

export class FaceToFaceModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'productCode'],
		message: 'validation.module.productCode.empty',
	})
	productCode: string

	@ValidateNested({
		groups: ['all', 'events'],
	})
	events: Event[]
}
