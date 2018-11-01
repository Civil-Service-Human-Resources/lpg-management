import {DateRange} from '../dateRange'
import {Factory} from './factory'

export class DateRangeFactory implements Factory<DateRange> {
	create(data: any) {
		let dateRange = new DateRange()

		dateRange.startDateTime = data.startDateTime
		dateRange.endDateTime = data.endDateTime

		return dateRange
	}
}
