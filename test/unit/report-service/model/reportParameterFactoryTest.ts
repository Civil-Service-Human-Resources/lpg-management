import * as Sinon from 'sinon'
import {TimePeriodParamsFactory} from '../../../../src/report-service/model/course-completions/timePeriodParamsFactory'
import {TimePeriodParameters} from '../../../../src/report-service/model/course-completions/timePeriodParameters'
import * as dayjs from 'dayjs'
import {ReportParameterFactory} from '../../../../src/report-service/model/reportParameterFactory'
import {ChooseOrganisationSession} from '../../../../src/controllers/reporting/model/chooseOrganisationSession'
import {expect} from 'chai'
import {FormattedOrganisation} from '../../../../src/csl-service/model/FormattedOrganisation'
import {CourseCompletionsSession} from '../../../../src/controllers/reporting/model/courseCompletionsSession'

describe("Report parameter factory tests", () => {
	const timePeriodParamsFactory = Sinon.createStubInstance(TimePeriodParamsFactory)
	const timePeriodParams = new TimePeriodParameters(dayjs(), dayjs(), "+00")
	timePeriodParamsFactory.createFromSession.returns(timePeriodParams)
	const factory = new ReportParameterFactory("testUrl.com", timePeriodParamsFactory as any)

	it('generateRegisteredLearnerReportRequestParams should create report request parameters from the session', () => {
		const session = new ChooseOrganisationSession("email.com", "Requester name", "uid")
		session.selectedOrganisations = [new FormattedOrganisation(1, "Org", "ORG")]
		const params = factory.generateRegisteredLearnerReportRequestParams(session)
		expect(params.fullName).to.equal("Requester name")
		expect(params.userId).to.equal("uid")
		expect(params.selectedOrganisationIds![0]).to.equal(1)
		expect(params.reportDownloadEndpoint).to.equal("testUrl.com/reporting/registered-learners/download-report")
	})

	it('generateCourseCompletionReportRequestParams should create report request parameters from the session', () => {
		const session = new CourseCompletionsSession("email.com", "Requester name", "uid")
		session.selectedOrganisations = [new FormattedOrganisation(1, "Org", "ORG")]
		session.learningSelection
		const params = factory.generateRegisteredLearnerReportRequestParams(session)
		expect(params.fullName).to.equal("Requester name")
		expect(params.userId).to.equal("uid")
		expect(params.selectedOrganisationIds![0]).to.equal(1)
		expect(params.reportDownloadEndpoint).to.equal("testUrl.com/reporting/registered-learners/download-report")
	})
})
