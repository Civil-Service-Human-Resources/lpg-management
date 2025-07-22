import {TimePeriodParameters} from './timePeriodParameters'

export class GetCourseCompletionParameters {
	constructor(public timePeriodParams: TimePeriodParameters,
				public courseIds: string[],
				public selectedOrganisationIds?: string[],
				public professionIds?: string[],
				public gradeIds?: string[]) { }

	public getAsApiParams() {		
		return {
			startDate: (this.timePeriodParams.startDate as any).utc().format('YYYY-MM-DDTHH:mm:ss'),
			endDate: (this.timePeriodParams.endDate as any).utc().format('YYYY-MM-DDTHH:mm:ss'),
			timezone: this.timePeriodParams.timezone,
			courseIds: this.courseIds,
			selectedOrganisationIds: this.selectedOrganisationIds,
			professionIds: this.professionIds,
			gradeIds: this.gradeIds,
		}
	}
}
