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

	getEvent(eventUri: string) {
		const events = this.events.filter(e => e.id === eventUri)
		if (events.length > 0) {
			return events[0]
		} else {
			return null
		}
	}

	type: Module.Type.FACE_TO_FACE
}
