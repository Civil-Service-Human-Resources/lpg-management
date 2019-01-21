import {IsNotEmpty, ValidateNested} from 'class-validator'
import {DateRange} from './dateRange'
import {Venue} from './venue'

export class Event {
	id: string

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.dateRanges'],
		message: 'validation_module_event_dateRanges_empty',
	})
	dateRanges: Array<DateRange> = []

	@ValidateNested({
		groups: ['all', 'event.all', 'event.location'],
	})
	venue: Venue

	status: Event.Status

	cancellationReason: string
}

export namespace Event {
	export enum Status {
		ACTIVE = 'Active',
		CANCELLED = 'Cancelled',
	}
}
