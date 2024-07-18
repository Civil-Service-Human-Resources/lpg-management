import {CourseCompletionsFilterModel} from '../../controllers/reporting/model/courseCompletionsFilterModel'
import {CourseCompletionsSession} from '../../controllers/reporting/model/courseCompletionsSession'
import {getFrontendDayJs} from '../../utils/dateUtil'
import {Dayjs} from 'dayjs'
import {DashboardTimePeriodEnum} from '../../controllers/reporting/model/dashboardTimePeriod'

var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

export class GetCourseAggregationParameters {
	constructor(public startDate: Dayjs,
				public endDate: Dayjs,
				public timezone: string,
				public courseIds: string[],
				public organisationIds: string[],
				public binDelimiter: string,
				public professionIds?: string[],
				public gradeIds?: string[]) { }

	static createForDay(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const endDate = getFrontendDayJs().add(1, 'day').startOf('day')
		const startDate = endDate.subtract(24, 'hours')
		return GetCourseAggregationParameters.createFromDates(startDate, endDate, courseIds, organisationIds, 'HOUR')
	}

	static createForPastSevenDays(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const endDate = getFrontendDayJs().endOf('day')
		const startDate = getFrontendDayJs().startOf('day').subtract(7, 'day')
		return GetCourseAggregationParameters.createFromDates(startDate, endDate, courseIds, organisationIds, 'DAY')
	}

	static createForPastMonth(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const endDate = getFrontendDayJs().endOf('day')
		const startDate = getFrontendDayJs().startOf('day').subtract(1, 'month')
		return GetCourseAggregationParameters.createFromDates(startDate, endDate, courseIds, organisationIds, 'DAY')
	}

	static createForPastYear(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const endDate = getFrontendDayJs().startOf('day')
		const startDate = endDate.subtract(1, 'year').startOf('month')
		return GetCourseAggregationParameters.createFromDates(startDate, endDate, courseIds, organisationIds, 'MONTH')
	}

	static createFromDates(startDate: Dayjs, endDate: Dayjs, courseIds: string[], organisationIds: string[],
						   binDelimiter: string) {
		const offsetInHours = startDate.utcOffset() / 60
		return new GetCourseAggregationParameters(startDate, endDate, `+${offsetInHours}`, courseIds, organisationIds, binDelimiter)
	}

	static createFromFilterPageModel(pageModel: CourseCompletionsFilterModel, session: CourseCompletionsSession) {
		const organisationIds = session.allOrganisationIds!.map(n => n.toString())
		switch (pageModel.getTimePeriod().type) {
			case DashboardTimePeriodEnum.PAST_SEVEN_DAYS: return GetCourseAggregationParameters.createForPastSevenDays(session.getCourseIds(), organisationIds)
			case DashboardTimePeriodEnum.PAST_MONTH: return GetCourseAggregationParameters.createForPastMonth(session.getCourseIds(), organisationIds)
			case DashboardTimePeriodEnum.PAST_YEAR: return GetCourseAggregationParameters.createForPastYear(session.getCourseIds(), organisationIds)
		}
		return GetCourseAggregationParameters.createForDay(session.getCourseIds(), organisationIds)
	}

	public getAsApiParams() {
		return {
			startDate: (this.startDate as any).utc().format('YYYY-MM-DDTHH:mm:ss'),
			endDate: (this.endDate as any).utc().format('YYYY-MM-DDTHH:mm:ss'),
			timezone: this.timezone,
			courseIds: this.courseIds,
			organisationIds: this.organisationIds,
			binDelimiter: this.binDelimiter,
			professionIds: this.professionIds,
			gradeIds: this.gradeIds,
		}
	}

}
