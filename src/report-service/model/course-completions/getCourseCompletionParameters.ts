import {TimePeriodParameters} from './timePeriodParameters'

export class GetCourseCompletionParameters {
	constructor(public timePeriodParams: TimePeriodParameters,
				public courseIds: string[],
				public organisationIds: string[],
				public professionIds?: string[],
				public gradeIds?: string[]) { }

	public getAsApiParams() {
		return {
			startDate: (this.timePeriodParams.startDate as any).utc().format('YYYY-MM-DDTHH:mm:ss'),
			endDate: (this.timePeriodParams.endDate as any).utc().format('YYYY-MM-DDTHH:mm:ss'),
			timezone: this.timePeriodParams.timezone,
			courseIds: this.courseIds,
			organisationIds: this.organisationIds,
			professionIds: this.professionIds,
			gradeIds: this.gradeIds,
		}
	}
}
