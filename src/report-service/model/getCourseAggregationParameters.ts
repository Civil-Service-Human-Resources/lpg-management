import dayjs = require('dayjs')
import {CourseCompletionsFilterModel} from '../../controllers/reporting/model/courseCompletionsFilterModel'
import {CourseCompletionsSession} from '../../controllers/reporting/model/courseCompletionsSession'

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

	static createFromFilterPageModel(pageModel: CourseCompletionsFilterModel, session: CourseCompletionsSession) {
		return GetCourseAggregationParameters.createForDay(session.getCourseIds(), session.allOrganisationIds!.map(n => n.toString()))
	}

	getStartDateAsDayJs() {
		return dayjs(this.startDate)
	}

	getEndDateAsDayJs() {
		return dayjs(this.endDate)
	}
}
