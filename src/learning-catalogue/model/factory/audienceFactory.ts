import {Audience} from '../audience'
import moment = require('moment')

export class AudienceFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	create(data: any) {
		const audience: Audience = new Audience()
		audience.id = data.id
		audience.name = data.name
		audience.areasOfWork = data.areasOfWork
		audience.departments = data.departments
		audience.grades = data.grades
		audience.interests = data.interests
		audience.requiredBy = data.requiredBy
		audience.type = Audience.Type[data.type as keyof typeof Audience.Type]
		audience.frequency = data.frequency ? moment.duration(data.frequency) : undefined
		audience.eventId = data.eventId

		return audience
	}
}
