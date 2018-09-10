import {Event} from '../event'

export class EventFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	public create(data: any): any {
		const event: Event = new Event()

		event.id = data.id

		event.dateRanges = data.dateRanges

		event.location = data.location
		event.capacity = data.capacity

		return event
	}
}
