import {IsFutureDateString} from '../validator/custom/isFutureDateString'
import {IsNotEmpty} from 'class-validator'
import {IsAfterTimeString} from '../validator/custom/isAfterTimeString'

export class DateRange {

	@IsFutureDateString({
		groups: ['all', 'event.all', 'event.dateRanges.date'],
		message: 'validation_module_event_dateRanges_past',
	})
	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.dateRanges.date'],
		message: 'validation_module_event_dateRanges_empty',
	})
	date: String

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.dateRanges.startTime'],
		message: 'validation_module_event_start_empty',
	})
	startTime: String

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.dateRanges.endTime'],
		message: 'validation_module_event_end_empty',
	})
	@IsAfterTimeString('startTime', {
		groups: ['all', 'event.all', 'event.dateRanges.endTime'],
		message: 'validation_module_event_dateRanges_endBeforeStart',
	})
	endTime: String
}
