import dayjs = require('dayjs')
import {CourseCompletionsFilterModel} from '../../controllers/reporting/model/courseCompletionsFilterModel'
import {CourseCompletionsSession} from '../../controllers/reporting/model/courseCompletionsSession'
import {DashboardTimePeriodEnum} from '../../controllers/reporting/model/dashboardTimePeriod'

export class GetCourseAggregationParameters {
	constructor(public startDate: string,
				public endDate: string,
				public courseIds: string[],
				public organisationIds: string[],
				public binDelimiter: string,
				public professionIds?: string[],
				public gradeIds?: string[]) { }

	static createForDay(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const startDate = dayjs()
		const endDate = startDate.add(1, 'day')
		return new GetCourseAggregationParameters(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), courseIds, organisationIds, 'HOUR')
	}

	static createForPastSevenDays(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const endDate = dayjs()
		const startDate = endDate.subtract(7, 'day')
		return new GetCourseAggregationParameters(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), courseIds, organisationIds, 'DAY')
	}

	static createFromFilterPageModel(pageModel: CourseCompletionsFilterModel, session: CourseCompletionsSession) {
		const organisationIds = session.allOrganisationIds!.map(n => n.toString())
		if (pageModel.getTimePeriod().type === DashboardTimePeriodEnum.PAST_SEVEN_DAYS) {
			return GetCourseAggregationParameters.createForPastSevenDays(session.getCourseIds(), organisationIds)
		}
		return GetCourseAggregationParameters.createForDay(session.getCourseIds(), organisationIds)
	}

	getStartDateAsDayJs() {
		return dayjs(this.startDate)
	}

	getEndDateAsDayJs() {
		return dayjs(this.endDate)
	}
}
