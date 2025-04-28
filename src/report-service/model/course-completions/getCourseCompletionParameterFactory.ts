import {GetCourseCompletionParameters} from './getCourseCompletionParameters'
import {TimePeriodParameters} from './timePeriodParameters'
import {CourseCompletionsSession} from '../../../controllers/reporting/model/courseCompletionsSession'

export class GetCourseCompletionParameterFactory {

	createFromSession(session: CourseCompletionsSession, timePeriodparams: TimePeriodParameters) {		
		return new GetCourseCompletionParameters(timePeriodparams, session.getCourseIds(),
		session.allOrganisationIds && session.allOrganisationIds!.map(n => n.toString()))
	}
}
