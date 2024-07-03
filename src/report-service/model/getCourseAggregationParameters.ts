import dayjs = require('dayjs')
import {CourseCompletionsFilterModel} from '../../controllers/reporting/model/courseCompletionsFilterModel'
import {CourseCompletionsSession} from '../../controllers/reporting/model/courseCompletionsSession'
import {getFrontendDayJs} from '../../utils/dateUtil'
import {Dayjs} from 'dayjs'

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

	static createFromFilterPageModel(pageModel: CourseCompletionsFilterModel, session: CourseCompletionsSession) {
		return GetCourseAggregationParameters.createForDay(session.getCourseIds(), session.allOrganisationIds!.map(n => n.toString()))
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
