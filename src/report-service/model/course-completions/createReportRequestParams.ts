import {GetCourseCompletionParameters} from './getCourseCompletionParameters'
import {TimePeriodParameters} from './timePeriodParameters'

export class CreateReportRequestParams extends GetCourseCompletionParameters {

	constructor(public userId: string, public fullName: string, public userEmail: string, timePeriodParams: TimePeriodParameters,
				courseIds: string[], organisationIds: string[], professionIds?: string[], gradeIds?: string[]) {
		super(timePeriodParams, courseIds, organisationIds, professionIds, gradeIds)
	}

	static createFromBaseReportParameters(userId: string, fullName: string, userEmail: string, params: GetCourseCompletionParameters) {
		return new CreateReportRequestParams(userId, fullName, userEmail, params.timePeriodParams,
			params.courseIds, params.organisationIds, params.professionIds, params.gradeIds)
	}

	public getAsApiParams() {
		return {
			...super.getAsApiParams(),
			userId: this.userId,
			fullName: this.fullName,
			userEmail: this.userEmail
		}
	}
}