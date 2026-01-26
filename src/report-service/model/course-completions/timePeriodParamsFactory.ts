import {TimePeriodParameters} from './timePeriodParameters'
import {getDayjs, getFrontendDayJs, getStartOfJs} from '../../../utils/dateUtil'
import {Dayjs} from 'dayjs'
import {CourseCompletionsSession} from '../../../controllers/reporting/model/courseCompletionsSession'

export class TimePeriodParamsFactory {

	createForDay(): TimePeriodParameters {
		const endDate = getFrontendDayJs()
		const startDate = endDate.startOf('day')
		return this.createFromDates(startDate, endDate)
	}

	createForPastSevenDays(): TimePeriodParameters {
		const endDate = getFrontendDayJs()
		const startDate = endDate.startOf('day').subtract(7, 'day')
		return this.createFromDates(startDate, endDate)
	}

	createForPastMonth(): TimePeriodParameters {
		const endDate = getFrontendDayJs()
		const startDate = endDate.startOf('day').subtract(1, 'month')
		return this.createFromDates(startDate, endDate)
	}

	createForPastYear(): TimePeriodParameters {
		const endDate = getFrontendDayJs()
		const startDate = endDate.startOf('month').subtract(1, 'year')
		return this.createFromDates(startDate, endDate)
	}

	createForCustom(startYear: string, startMonth: string, startDay: string,
					endYear: string, endMonth: string, endDay: string,): TimePeriodParameters {
		let start = getDayjs(`${startYear}-${startMonth}-${startDay}`)
		let end = getDayjs(`${endYear}-${endMonth}-${endDay}`)
		start = getStartOfJs(start, end)
		return this.createFromDates(start, end)
	}

	createFromDates(startDate: Dayjs, endDate: Dayjs) {
		return new TimePeriodParameters(startDate, endDate)
	}

	createFromSession(session: CourseCompletionsSession) {
		switch (session.timePeriod) {
			case 'past-seven-days': return this.createForPastSevenDays()
			case 'past-month': return this.createForPastMonth()
			case 'past-year': return this.createForPastYear()
			case 'custom': return this.createForCustom(session.startYear!, session.startMonth!, session.startDay!,
				session.endYear!, session.endMonth!, session.endDay!)
		}
		return this.createForDay()
	}
}
