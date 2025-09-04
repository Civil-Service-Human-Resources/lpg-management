import {CourseCompletionsSession} from '../../controllers/reporting/model/courseCompletionsSession'
import {GetCourseCompletionParameters} from './course-completions/getCourseCompletionParameters'
import {CreateReportRequestParams} from './createReportRequestParams'
import {ChooseOrganisationSession} from '../../controllers/reporting/model/chooseOrganisationSession'
import {Report} from '../../controllers/reporting/Report'
import {TimePeriodParamsFactory} from './course-completions/timePeriodParamsFactory'
import {CourseCompletionReportRequestParams} from './course-completions/courseCompletionReportRequestParams'

export class ReportParameterFactory {

	constructor(private managementUrl: string,
				private timePeriodParamsFactory: TimePeriodParamsFactory) {
	}

	createFromSession(session: ChooseOrganisationSession, type: Report): CreateReportRequestParams {
		const reportTypeUrl = type === Report.COURSE_COMPLETIONS ? 'course-completions' : 'registered-learners'
		return new CreateReportRequestParams(session.userUid, session.fullName,
			session.userEmail, `${this.managementUrl}/reporting/${reportTypeUrl}/download-report`,
			session.selectedOrganisations ? session.selectedOrganisations.map(o => o.id) : undefined)
	}

	public generateRegisteredLearnerReportRequestParams(session: ChooseOrganisationSession): CreateReportRequestParams {
		return this.createFromSession(session, Report.REGISTERED_LEARNERS)
	}

	public generateCourseCompletionReportRequestParams(session: CourseCompletionsSession): CourseCompletionReportRequestParams {
		const reportRequestParams = this.createFromSession(session, Report.COURSE_COMPLETIONS)
		const courseCompletionParams = this.generateCourseAggregationsParams(session)
		return new CourseCompletionReportRequestParams(reportRequestParams.userId, reportRequestParams.fullName,
			reportRequestParams.userEmail, reportRequestParams.reportDownloadEndpoint, courseCompletionParams)
	}

	public generateCourseAggregationsParams(session: CourseCompletionsSession): GetCourseCompletionParameters {
		const timePeriodParams = this.timePeriodParamsFactory.createFromSession(session)
		return new GetCourseCompletionParameters(timePeriodParams, session.getCourseIds(),
			session.selectedOrganisations && session.selectedOrganisations!.map(n => n.id.toString()))
	}

}
