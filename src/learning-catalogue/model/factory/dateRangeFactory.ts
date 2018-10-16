import {DateRange} from '../dateRange'
import {Factory} from './factory'
import {DateTime} from '../../../lib/dateTime'

export class DateRangeFactory implements Factory<DateRange> {
	create(data: any) {
		let dateRange = new DateRange()

		dateRange.date = data.date
		dateRange.startTime = data.startTime
		dateRange.endTime = data.endTime
		dateRange.formattedDate = DateTime.convertDate(data.date)

		return dateRange
	}
}
