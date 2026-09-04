import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {LearningTagService} from '../../../../src/learning-catalogue/service/learningTagService'
import {createSubApp, getApp} from '../../../utils/testApp'
import {FormattedTaxonomyItem} from '../../../../src/lib/taxonomy/formattedTaxonomyItem'
import {
	LearningTagAssignCoursesController,
} from '../../../../src/controllers/learningTag/learningTagAssignCoursesController'
import {CourseService} from '../../../../src/lib/courseService'
import {BasicCourse} from '../../../../src/learning-catalogue/courseTypeAhead'
import {AssignCoursesToTagsModel} from '../../../../src/controllers/learningTag/model/assignCoursesToTagsModel'

const session = require('supertest-session')
import sinonChai = require('sinon-chai')

chai.use(sinonChai)

describe('LearningTagAssignCourses', () => {
	let learningTagService: sinon.SinonStubbedInstance<LearningTagService> = sinon.createStubInstance(LearningTagService)
	let courseService: sinon.SinonStubbedInstance<CourseService> = sinon.createStubInstance(CourseService)
	let controller: LearningTagAssignCoursesController = new LearningTagAssignCoursesController(learningTagService as any, courseService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())
	const typeahead = [
		new FormattedTaxonomyItem(1, "tag 1", "TAG1"),
		new FormattedTaxonomyItem(2, "tag 2", "TAG2"),
		new FormattedTaxonomyItem(3, "tag 3", "TAG3")
	]
	learningTagService.getTypeahead.resolves(typeahead)

	const courseTypeahead = [
		new BasicCourse("COURSE1", "Course 1"),
		new BasicCourse("COURSE2", "Course 2"),
		new BasicCourse("COURSE3", "Course 3")
	]
	courseService.getCourseDropdown.resolves(courseTypeahead)

	describe('Access', () => {
		it('should restrict access to admins who do not have the correct roles', async () => {
			const request = session(app)
				.get('/content-management/learning-tags/assign-courses/select-learning-tags')
				.set({"roles": 'LEARNING_TAG_MANAGER'})
			const res = await request.send()
			expect(res.status).to.eql(401)
		})
		it('should allow access to admins who have the correct roles', async () => {
			const request = session(app)
				.get('/content-management/learning-tags/assign-courses/select-learning-tags')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
			const res = await request.send()
			expect(res.status).to.eql(200)
		})
	})
	describe('Select learning tags', () => {
		it('Should redirect to select courses when an admin has selected learning tags', async () => {
			const res = await session(app)
				.post('/content-management/learning-tags/assign-courses/select-learning-tags')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					tagSearch: [1, 2]
				})
			expect(res.status).to.eql(302)
			expect(res.headers['location']).to.eql("/content-management/learning-tags/assign-courses/select-courses")
		})
		it('Should show an error message when no tags have been selected', async () => {
			const res = await session(app)
				.post('/content-management/learning-tags/assign-courses/select-learning-tags')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					tagSearch: undefined
				})
			expect(res.status).to.eql(200)
			expect(res.text).to.include('Please select a valid number of tags')
		})
		it('Should show an error message when too many tags have been selected', async () => {
			const res = await session(app)
				.post('/content-management/learning-tags/assign-courses/select-learning-tags')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					tagSearch: Array.from(Array(20).keys())
				})
			expect(res.status).to.eql(200)
			expect(res.text).to.include('Please select a valid number of tags')
		})
	})
	describe('Select courses', () => {
		it('Should redirect to select learning tags when no learning tags have been selected', async () => {
			const res = await session(app)
				.get('/content-management/learning-tags/assign-courses/select-courses')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send()
			expect(res.status).to.eql(302)
			expect(res.headers['location']).to.eql("/content-management/learning-tags/assign-courses/select-learning-tags")
		})
		it('should allow access when learning tags have been selected and stored in the session', async () => {
			const subApp = createSubApp()
			subApp.all('*', (req, res, next) => {
				req.session!.assignCoursesToTagsModel = new AssignCoursesToTagsModel(["tag1"])
				next()
			}).use(app)
			const res = await session(subApp)
				.get('/content-management/learning-tags/assign-courses/select-courses')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send()
			expect(res.status).to.eql(200)
		})
		it('should successfully redirect to /manage when courses have been selected', async () => {
			const subApp = createSubApp()
			subApp.all('*', (req, res, next) => {
				req.session!.assignCoursesToTagsModel = new AssignCoursesToTagsModel(["tag1"])
				next()
			}).use(app)
			const res = await session(subApp)
				.post('/content-management/learning-tags/assign-courses/select-courses')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					courseSearch: Array.from(Array(3).keys())
				})
			expect(res.status).to.eql(302)
			expect(res.headers['location']).to.eql("/content-management/learning-tags/manage")
		})
	})
})