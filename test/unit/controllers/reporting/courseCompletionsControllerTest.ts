import * as sinon from 'sinon'
import {getApp} from '../../../utils/testApp'
import {ReportService} from '../../../../src/report-service'
const session = require('supertest-session')
import {expect} from 'chai'
import {CourseCompletionsController} from '../../../../src/controllers/reporting/courseCompletionsController'
import {BasicCourse, ChooseCoursesModel} from '../../../../src/controllers/reporting/model/chooseCoursesModel'

describe('courseCompletionsController tests', () => {
	let reportService: sinon.SinonStubbedInstance<ReportService> = sinon.createStubInstance(ReportService)
	const controller: CourseCompletionsController = new CourseCompletionsController(reportService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())

	describe('RBAC', () => {
		it('Should block non mvp-reporter users', async () => {
			const res = await session(app)
				.post("/reporting/course-completions/choose-courses")
				.set({"roles": 'ORGANISATION_REPORTER'})
				.send()
			expect(res.status).to.eql(401)
		})
	})

	describe('Select courses tests', () => {
		it('Should render required learning correctly', async () => {
			reportService.getChooseCoursePage.withArgs().resolves(new ChooseCoursesModel('department', [
				new BasicCourse('1', 'course 1'),
				new BasicCourse('2', 'course 2'),
				new BasicCourse('3', 'course 3')
			]))
			const res = await session(app)
				.get("/reporting/course-completions/choose-courses")
				.set({"roles": 'MVP_REPORTER,ORGANISATION_REPORTER'})
				.send()
			expect(res.status).to.eql(200)
			expect(res.text).to.contain("Required learning for department")
		})
	})
})
