import {IsDate} from 'class-validator'
import {IsFutureDate} from '../validator/custom/isFutureDate'
import {IsAfterDate} from '../validator/custom/isAfterDate'

export class DateRange {
	@IsDate({
		groups: ['all', 'event.all', 'event.dateRanges'],
		message: 'module.validation.event.startDateTime.invalidDate',
	})
	@IsFutureDate({
		groups: ['all', 'event.all', 'event.dateRanges'],
		message: 'module.validation.event.startDateTime.dateIsNotInFuture',
	})
	startDateTime: Date

	@IsAfterDate('startDateTime', {
		groups: ['all', 'event.all', 'event.dateRanges'],
		message: 'module.validation.event.endDateTime.endTimeNotAfterStart',
	})
	endDateTime: Date
}
