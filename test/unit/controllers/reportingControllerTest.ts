import {beforeEach, describe, it} from 'mocha'
import {ReportingController} from '../../../src/controllers/reportingController'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'
import {ReportService} from '../../../src/report-service'
import {Validator} from '../../../src/learning-catalogue/validator/validator'
import {DateStartEndCommand} from '../../../src/controllers/command/dateStartEndCommand'
import {DateStartEndCommandFactory} from '../../../src/controllers/command/factory/dateStartEndCommandFactory'
import {DateStartEnd} from '../../../src/learning-catalogue/model/dateStartEnd'

chai.use(sinonChai)

describe('Reporting Controller Tests', function() {
	let reportingController: ReportingController
	let reportService: ReportService
	let dateStartEndCommandValidator: Validator<DateStartEndCommand>
	let dateStartEndCommandFactory: DateStartEndCommandFactory
	let dateStartEndValidator: Validator<DateStartEnd>

	beforeEach(() => {
		reportService = <ReportService>{}
		dateStartEndCommandValidator: <Validator<DateStartEndCommand>>{}
		dateStartEndCommandFactory: <DateStartEndCommandFactory>{}
		dateStartEndValidator: <Validator<DateStartEnd>>{}
		reportingController = new ReportingController(reportService, dateStartEndCommandFactory, dateStartEndCommandValidator, dateStartEndValidator)
	})

	it('should render reporting home page', async function() {
		const getReports: (req: Request, res: Response) => void = reportingController.getReports()

		const req: Request = mockReq()

		const res: Response = mockRes()

		await getReports(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/reporting/index')
	})
})
