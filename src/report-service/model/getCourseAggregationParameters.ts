export class GetCourseAggregationParameters {
	constructor(public startDate: string,
				public endDate: string,
				public courseIds: string[],
				public organisationIds: string[],
				public professionIds: string[],
				public gradeIds: string[],
				public binDelimiter: string) { }

}
