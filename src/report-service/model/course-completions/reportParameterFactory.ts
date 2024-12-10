import {CourseCompletionsSession} from '../../../controllers/reporting/model/courseCompletionsSession'
import {TimePeriodParamsFactory} from './timePeriodParamsFactory'
import {CreateReportRequestReportParameterFactory} from './createReportRequestParameterFactory'
import {GetCourseCompletionParameterFactory} from './getCourseCompletionParameterFactory'

export class ReportParameterFactory {

	constructor(public timePeriodParamsFactory: TimePeriodParamsFactory,
				public createReportRequestParamFactory: CreateReportRequestReportParameterFactory,
				public getCourseAggregationsParamfactory: GetCourseCompletionParameterFactory) {
	}

	public generateReportRequestParams(session: CourseCompletionsSession) {
		const timePeriodParams = this.timePeriodParamsFactory.createFromSession(session)
		return this.createReportRequestParamFactory.createFromSession(session, timePeriodParams)
	}

	public generateCourseAggregationsParams(session: CourseCompletionsSession) {
		const timePeriodParams = this.timePeriodParamsFactory.createFromSession(session)
		return this.getCourseAggregationsParamfactory.createFromSession(session, timePeriodParams)
	}

}
