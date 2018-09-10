import {IsNotEmpty, IsPositive} from 'class-validator'
import {DateRange} from './DateRange'

export class Event {
	id: string

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.dateRanges'],
		message: 'validation_module_event_dateRanges_empty',
	})
	dateRanges: Array<DateRange> | undefined

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.location'],
		message: 'validation_module_event_location_empty',
	})
	location: string

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.capacity'],
		message: 'validation_module_event_capacity_empty',
	})
	@IsPositive({
		groups: ['all', 'event.all', 'event.capacity'],
		message: 'validation_module_event_capacity_positive',
	})
	capacity: number
}
