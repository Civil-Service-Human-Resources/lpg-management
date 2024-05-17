import * as sinon from 'sinon'
import {getApp} from '../../../utils/testApp'
import {ReportService} from '../../../../src/report-service'
import {ReportingController} from '../../../../src/controllers/reporting/reportingController'
import * as request from 'supertest'
const session = require('supertest-session')
import {expect} from 'chai'

describe('reportingController tests', () => {
	let reportService: sinon.SinonStubbedInstance<ReportService> = sinon.createStubInstance(ReportService)
	const controller: ReportingController = new ReportingController(reportService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())

	describe('Generate report tests', () => {
		describe('validate date parameters', () => {
			it('Should validate empty parameters', async () => {
				const res = await session(app)
					.post("/reporting/booking-information")
					.set({"roles": 'ORGANISATION_REPORTER'})
					.send({
						startDay: '',
						startMonth: '',
						startYear: '',
						endDay: '',
						endMonth: '',
						endYear: '',
					})
				expect(res.status).to.eql(302)
				expect(res.header['location']).to.eql("/reporting")
			})
			it('Should validate invalid date parameters', async () => {
				const res = await request(app)
					.post("/reporting/booking-information")
					.set({"roles": 'ORGANISATION_REPORTER'})
					.send({
						startDay: '100',
						startMonth: '100',
						startYear: '100',
						endDay: '200',
						endMonth: '200',
						endYear: '200',
					})
				expect(res.status).to.eql(302)
			})
			it('Should validate start date is before end date', async () => {
				const res = await request(app)
					.post("/reporting/booking-information")
					.set({"roles": 'ORGANISATION_REPORTER'})
					.send({
						startDay: '10',
						startMonth: '12',
						startYear: '2024',
						endDay: '10',
						endMonth: '12',
						endYear: '2023',
					})
				expect(res.status).to.eql(302)
			})
		})


		describe('Generate booking report tests', () => {
			reportService.getReport.resolves(new Buffer('test'))
			it('Should generate booking report', async () => {
				const res = await request(app)
					.post("/reporting/booking-information")
					.set({"roles": 'ORGANISATION_REPORTER'})
					.send({
						startDay: '10',
						startMonth: '12',
						startYear: '2024',
						endDay: '10',
						endMonth: '12',
						endYear: '2025',
					})
				expect(res.status).to.eql(200)
				expect(res.type).to.eql('text/csv')
				expect(res.headers['content-disposition']).to.contain('attachment;filename=Booking_information')
			})
			it('Should generate module report', async () => {
				const res = await request(app)
					.post("/reporting/learner-record")
					.set({"roles": 'ORGANISATION_REPORTER'})
					.send({
						startDay: '10',
						startMonth: '12',
						startYear: '2024',
						endDay: '10',
						endMonth: '12',
						endYear: '2025',
					})
				expect(res.status).to.eql(200)
				expect(res.type).to.eql('text/csv')
				expect(res.headers['content-disposition']).to.contain('attachment;filename=Learner_record')
			})
		})
	})
})
