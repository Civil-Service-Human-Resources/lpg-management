import {CourseCompletionsSession} from '../../../controllers/reporting/model/courseCompletionsSession'
import {CreateReportRequestParams} from './createReportRequestParams'
import {GetCourseCompletionParameterFactory} from './getCourseCompletionParameterFactory'
import {TimePeriodParameters} from './timePeriodParameters'

export class CreateReportRequestReportParameterFactory extends GetCourseCompletionParameterFactory {

	constructor(private managementUrl: string) {
		super()
	}

	createFromSession(session: CourseCompletionsSession, timePeriodParams: TimePeriodParameters): CreateReportRequestParams {
		const params = super.createFromSession(session, timePeriodParams)
		return CreateReportRequestParams.createFromBaseReportParameters(session.userUid, session.fullName,
			session.userEmail, `${this.managementUrl}/reporting/course-completions/download-report`, params)
	}

}
