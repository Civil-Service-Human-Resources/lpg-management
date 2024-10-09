import {TimePeriodParameters} from './timePeriodParameters'
import {getFrontendDayJs} from '../../../utils/dateUtil'
import {Dayjs} from 'dayjs'
import {DashboardTimePeriodEnum} from '../../../controllers/reporting/model/dashboardTimePeriod'

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

	createFromDates(startDate: Dayjs, endDate: Dayjs) {
		const offsetInHours = startDate.utcOffset() / 60
		return new TimePeriodParameters(startDate, endDate, `+${offsetInHours}`)
	}

	createFromTimePeriodEnum(timePeriod: DashboardTimePeriodEnum) {
		switch (timePeriod) {
			case DashboardTimePeriodEnum.PAST_SEVEN_DAYS: return this.createForPastSevenDays()
			case DashboardTimePeriodEnum.PAST_MONTH: return this.createForPastMonth()
			case DashboardTimePeriodEnum.PAST_YEAR: return this.createForPastYear()
		}
		return this.createForDay()
	}
}
