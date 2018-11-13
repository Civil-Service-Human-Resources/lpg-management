import {LearnerRecordEvent} from '../learnerRecordEvent'

export class LearnerRecordEventFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	public create(data: any) {
		let event: LearnerRecordEvent = new LearnerRecordEvent()

		event.id = data.id
		event.eventUid = data.eventUid
		event.path = data.path

		return event
	}
}
