import * as sinon from 'sinon'
import {createSubApp, getApp} from '../../../utils/testApp'
import {ReportService} from '../../../../src/report-service'
const session = require('supertest-session')
import {expect} from 'chai'
import {CourseCompletionsController} from '../../../../src/controllers/reporting/courseCompletionsController'
import {BasicCourse, ChooseCoursesModel} from '../../../../src/controllers/reporting/model/chooseCoursesModel'
import {CourseCompletionsSession} from '../../../../src/controllers/reporting/model/courseCompletionsSession'

describe('courseCompletionsController tests', () => {
	let reportService: sinon.SinonStubbedInstance<ReportService> = sinon.createStubInstance(ReportService)
	const controller: CourseCompletionsController = new CourseCompletionsController(reportService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())

	describe('authorisation', () => {
		it('Should block non mvp-reporter users', async () => {
			const res = await session(app)
				.post("/reporting/course-completions/choose-courses")
				.set({"roles": 'ORGANISATION_REPORTER'})
				.send()
			expect(res.status).to.eql(401)
		})
		// it('Should redirect when there are no organisationIds in the session', async () => {
		// 	const res = await session(app)
		// 		.get("/reporting/course-completions/choose-courses")
		// 		.set({"roles": 'MVP_REPORTER,ORGANISATION_REPORTER'})
		// 		.send()
		// 	expect(res.status).to.eql(302)
		// 	expect(res.headers['location']).to.eql("/reporting/course-completions/choose-organisation")
		// })
	})

	describe('Select courses tests', () => {
		const subApp = createSubApp()
		subApp.all('*', (req, res, next) => {
			req.session!.courseCompletions = new CourseCompletionsSession([1])
			next()
		}).use(app)
		reportService.getChooseCoursePage.withArgs().resolves(new ChooseCoursesModel('department', [
			new BasicCourse('1', 'course 1'),
			new BasicCourse('2', 'course 2'),
			new BasicCourse('3', 'course 3')
		]))
		it('Should render required learning correctly', async () => {
			const res = await session(subApp)
				.get("/reporting/course-completions/choose-courses")
				.set({"roles": 'MVP_REPORTER,ORGANISATION_REPORTER'})
				.send()
			expect(res.status).to.eql(200)
			expect(res.text).to.contain("Required learning for department")
		})

		it('Should validate required learning selection', async () => {
			const res = await session(subApp)
				.post("/reporting/course-completions/choose-courses")
				.set({"roles": 'MVP_REPORTER,ORGANISATION_REPORTER'})
				.send({
					learning: 'requiredLearning',
				})
			expect(res.status).to.eql(302)
			expect(res.headers['location']).to.eql("/reporting/course-completions/choose-courses")
		})

		it('Should successfully redirect with correct selections', async () => {
			const res = await session(subApp)
				.post("/reporting/course-completions/choose-courses")
				.set({"roles": 'MVP_REPORTER,ORGANISATION_REPORTER'})
				.send({
					learning: 'requiredLearning',
					requiredLearning: ['course1']
				})
			expect(res.status).to.eql(302)
			expect(res.headers['location']).to.eql("/reporting/course-completions")
		})
	})

})
