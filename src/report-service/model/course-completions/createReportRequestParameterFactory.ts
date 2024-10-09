import {CourseCompletionsSession} from '../../../controllers/reporting/model/courseCompletionsSession'
import {CreateReportRequestParams} from './createReportRequestParams'
import {GetCourseCompletionParameterFactory} from './getCourseCompletionParameterFactory'
import {TimePeriodParameters} from './timePeriodParameters'

export class CreateReportRequestReportParameterFactory extends GetCourseCompletionParameterFactory {

	createFromSession(session: CourseCompletionsSession, timePeriodParams: TimePeriodParameters): CreateReportRequestParams {
		const params = super.createFromSession(session, timePeriodParams)
		return CreateReportRequestParams.createFromBaseReportParameters(session.userUid, session.userEmail, params)
	}

}
