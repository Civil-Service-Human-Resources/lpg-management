import * as sinon from 'sinon'
import {createSubApp, getApp} from '../../../utils/testApp'
const session = require('supertest-session')
import {expect} from 'chai'
import {OrganisationPageModelService} from '../../../../src/controllers/reporting/organisationPageModelService'
import {FormattedOrganisation} from '../../../../src/csl-service/model/FormattedOrganisation'
import {RegisteredLearnersController} from '../../../../src/controllers/reporting/registeredLearnersController'
import {ChooseOrganisationSession} from '../../../../src/controllers/reporting/model/chooseOrganisationSession'
import {ReportExportService} from '../../../../src/controllers/reporting/reportExportService'

describe('courseCompletionsController tests', () => {
	let organisationPageModelService: sinon.SinonStubbedInstance<OrganisationPageModelService> = sinon.createStubInstance(OrganisationPageModelService)
	let reportExportService: sinon.SinonStubbedInstance<ReportExportService> = sinon.createStubInstance(ReportExportService)
	const controller: RegisteredLearnersController = new RegisteredLearnersController(organisationPageModelService as any, reportExportService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())

	describe('controller authorisation', () => {
		it('Should block non registered-learner users', async () => {
			const res = await session(app)
				.post("/reporting/registered-learners/choose-organisation")
				.set({"roles": 'ORGANISATION_REPORTER'})
				.send()
			expect(res.status).to.eql(401)
		})
	})

	describe('Get report tests', () => {
		describe('Without session', () => {
			it('Should redirect when there isnt valid organisation in the session', async () => {
				const res = await session(app)
					.get("/reporting/registered-learners")
					.set({"roles": 'MVP_REPORTER,ORGANISATION_REPORTER,REGISTERED_LEARNER_REPORTER'})
					.send()
				expect(res.status).to.eql(302)
				expect(res.headers['location']).to.eql("/reporting/registered-learners/choose-organisation")
			})
		})
		describe('With session', () => {
			it('Should render the download page when there is a valid organisation in the session', async () => {
				const subApp = createSubApp()
				const formattedOrg = new FormattedOrganisation(1, "Org", "O", "O")
				subApp.all('*', (req, res, next) => {
					req.session!.chooseOrganisations = new ChooseOrganisationSession("email", "fullName", "uid", 1, [formattedOrg])
					next()
				}).use(app)
				reportExportService.getRegisteredLearnerOverview.resolves({hasRequests: true})
				const res = await session(subApp)
					.get("/reporting/registered-learners")
					.set({"roles": 'MVP_REPORTER,ORGANISATION_REPORTER,REGISTERED_LEARNER_REPORTER'})
					.send()
				expect(res.status).to.eql(200)
			})
		})
	})

})
