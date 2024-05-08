import {beforeEach, describe, it} from 'mocha'
import {ReportingController} from '../../../src/controllers/reportingController'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as sinon from 'sinon'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import {ReportService} from '../../../src/report-service'
import {Validator} from '../../../src/learning-catalogue/validator/validator'
import {DateStartEndCommand} from '../../../src/controllers/command/dateStartEndCommand'
import {DateStartEndCommandFactory} from '../../../src/controllers/command/factory/dateStartEndCommandFactory'
import {DateStartEnd} from '../../../src/learning-catalogue/model/dateStartEnd'
import { CsrsService } from 'src/csrs/service/csrsService'
import { OrganisationalUnitService } from 'src/csrs/service/organisationalUnitService'
import { OrganisationalUnit } from 'src/csrs/model/organisationalUnit'

chai.use(sinonChai)

describe('Reporting Controller Tests', function() {
	let reportingController: ReportingController
	let reportService: ReportService
	let dateStartEndCommandValidator: Validator<DateStartEndCommand>
	let dateStartEndCommandFactory: DateStartEndCommandFactory
	let dateStartEndValidator: Validator<DateStartEnd>
	let csrsService: CsrsService
	let organisationalUnitService: OrganisationalUnitService

	beforeEach(() => {
		reportService = <ReportService>{}
		csrsService = <CsrsService>{}
		dateStartEndCommandValidator: <Validator<DateStartEndCommand>>{}
		dateStartEndCommandFactory: <DateStartEndCommandFactory>{}
		dateStartEndValidator: <Validator<DateStartEnd>>{}
		organisationalUnitService: <OrganisationalUnitService>{}
		reportingController = new ReportingController(reportService, dateStartEndCommandFactory, dateStartEndCommandValidator, dateStartEndValidator, csrsService, organisationalUnitService)
	})

	it('should render reporting home page', async function() {
		const getReports: (req: Request, res: Response) => void = reportingController.getReports()

		const req: Request = mockReq()

		const res: Response = mockRes()

		await getReports(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/reporting/index')
	})

	it("userCanAccessReportingForOrganisation() should return true if selected organisationId is included in the user's organisational units", async function() {
		let organisation1 = new OrganisationalUnit()
		organisation1.id = 1
		let organisation2 = new OrganisationalUnit()
		organisation2.id = 2

		const getOrganisationalUnitsForUser = sinon
			.stub()
			.returns([organisation1, organisation2])
		
		csrsService.getOrganisationalUnitsForUser = getOrganisationalUnitsForUser

		let selectedOrganisationId = 1

		let expectedResult = true
		let actualResult = await reportingController.userCanAccessReportingForOrganisation(<any>{}, selectedOrganisationId)

		expect(actualResult).to.equal(expectedResult)
	})

	it("userCanAccessReportingForOrganisation() should return false if selected organisationId is not included in the user's organisational units", async function() {
		let organisation1 = new OrganisationalUnit()
		organisation1.id = 1
		let organisation2 = new OrganisationalUnit()
		organisation2.id = 2

		const getOrganisationalUnitsForUser = sinon
			.stub()
			.returns([organisation1, organisation2])
		
		csrsService.getOrganisationalUnitsForUser = getOrganisationalUnitsForUser

		let selectedOrganisationId = 4

		let expectedResult = false
		let actualResult = await reportingController.userCanAccessReportingForOrganisation(<any>{}, selectedOrganisationId)

		expect(actualResult).to.equal(expectedResult)
	})

	it("getAllChildOrganisations() should return every descendent organisation as a flat array", () => {
		let organisation1 = new OrganisationalUnit()
		organisation1.id = 1
		
		let organisation2 = new OrganisationalUnit()
		organisation2.id = 2
		
		let organisation3 = new OrganisationalUnit()
		organisation3.id = 3

		let organisation4 = new OrganisationalUnit()
		organisation4.id = 4

		let organisation5 = new OrganisationalUnit()
		organisation5.id = 5

		let organisation6 = new OrganisationalUnit()
		organisation6.id = 6

		organisation4.children = [organisation5, organisation6]
		organisation2.children = [organisation3, organisation4]
		organisation1.children = [organisation2]

		let actualResult = reportingController.getAllChildOrganisations(organisation1)
		expect(actualResult.length).to.equal(6)

		expect(actualResult[0].id).to.equal(1)
		expect(actualResult[1].id).to.equal(2)
		expect(actualResult[2].id).to.equal(3)
		expect(actualResult[3].id).to.equal(4)
		expect(actualResult[4].id).to.equal(5)
		expect(actualResult[5].id).to.equal(6)		

	})
})
