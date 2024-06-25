import dayjs = require('dayjs')
import {CourseCompletionsFilterModel} from '../../controllers/reporting/model/courseCompletionsFilterModel'
import {CourseCompletionsSession} from '../../controllers/reporting/model/courseCompletionsSession'
import {getFrontendDayJs} from '../../utils/dateUtil'
import {Dayjs} from 'dayjs'
import {DashboardTimePeriodEnum} from '../../controllers/reporting/model/dashboardTimePeriod'

export class GetCourseAggregationParameters {
	constructor(public startDate: Dayjs,
				public endDate: Dayjs,
				public courseIds: string[],
				public organisationIds: string[],
				public binDelimiter: string,
				public professionIds?: string[],
				public gradeIds?: string[]) { }

	static createForDay(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const startDate = getFrontendDayJs().startOf('day')
		const endDate = startDate.add(25, 'hours')
		return new GetCourseAggregationParameters(startDate, endDate, courseIds, organisationIds, 'HOUR')
	}

	static createForPastSevenDays(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const endDate = dayjs().add(1, 'day')
		const startDate = dayjs().subtract(7, 'day')
		return new GetCourseAggregationParameters(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), courseIds, organisationIds, 'DAY')
	}

	static createFromFilterPageModel(pageModel: CourseCompletionsFilterModel, session: CourseCompletionsSession) {
		const organisationIds = session.allOrganisationIds!.map(n => n.toString())
		if (pageModel.getTimePeriod().type === DashboardTimePeriodEnum.PAST_SEVEN_DAYS) {
			return GetCourseAggregationParameters.createForPastSevenDays(session.getCourseIds(), organisationIds)
		}
		return GetCourseAggregationParameters.createForDay(session.getCourseIds(), organisationIds)
	}

	public getAsApiParams() {
		return {
			startDate: this.startDate.toISOString().split("T")[0],
			endDate: this.endDate.toISOString().split("T")[0],
			courseIds: this.courseIds,
			organisationIds: this.organisationIds,
			binDelimiter: this.binDelimiter,
			professionIds: this.professionIds,
			gradeIds: this.gradeIds,
		}
	}

	getStartDateAsDayJs() {
		return dayjs(this.startDate)
	}

	getEndDateAsDayJs() {
		return dayjs(this.endDate)
	}
}
