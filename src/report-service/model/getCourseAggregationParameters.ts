import dayjs = require('dayjs')

export class GetCourseAggregationParameters {
	constructor(public startDate: string,
				public endDate: string,
				public courseIds: string[],
				public organisationIds: string[],
				public binDelimiter: string,
				public professionIds?: string[],
				public gradeIds?: string[]) { }

	static createForDay(courseIds: string[], organisationIds: string[]): GetCourseAggregationParameters {
		const endDate = dayjs().format('YYYY-MM-DDTHH:mm:ssZ')
		const startDate = dayjs().set('hours', 0).set('minutes', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ssZ')
		return new GetCourseAggregationParameters(startDate, endDate, courseIds, organisationIds, 'HOUR')
	}

	getStartDateAsDayJs() {
		return dayjs(this.startDate)
	}

	getEndDateAsDayJs() {
		return dayjs(this.endDate)
	}
}
