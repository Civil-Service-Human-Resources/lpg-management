import {Event} from '../event'
import {VenueFactory} from './venueFactory'
import {DateRangeFactory} from './dateRangeFactory'
import {DateTime} from '../../../lib/dateTime'

export class EventFactory {
	venueFactory: VenueFactory
	dateRangeFactory: DateRangeFactory

	constructor(venueFactory: VenueFactory = new VenueFactory(), dateRangeFactory = new DateRangeFactory()) {
		this.venueFactory = venueFactory
		this.dateRangeFactory = dateRangeFactory
		this.create = this.create.bind(this)
	}

	public create(data: any): any {
		const event: Event = new Event()

		event.id = data.id

		event.dateRanges = (data.dateRanges || []).map(this.dateRangeFactory.create)
		event.dateRanges.sort((dateRange1, dateRange2) => DateTime.sortDateRanges(dateRange1, dateRange2))

		event.venue = this.venueFactory.create(data.venue)
		event.status = data.status

		event.cancellationReason = data.cancellationReason

		return event
	}
}
