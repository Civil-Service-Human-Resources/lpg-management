import {GetCourseCompletionParameters} from './getCourseCompletionParameters'
import {CreateReportRequestParams} from '../createReportRequestParams'

export class CourseCompletionReportRequestParams extends CreateReportRequestParams {

	constructor(public userId: string, public fullName: string, public userEmail: string, public reportDownloadEndpoint: string,
				public getCourseCompletionParams: GetCourseCompletionParameters) {
		super(userId, fullName, userEmail, reportDownloadEndpoint, getCourseCompletionParams.timezone, getCourseCompletionParams.selectedOrganisationIds)
	}

	public getAsApiParams() {
		return {
			...super.getAsApiParams(),
			...this.getCourseCompletionParams.getAsApiParams()
		}
	}
}
