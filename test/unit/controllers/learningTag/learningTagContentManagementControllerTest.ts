import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {LearningTag} from '../../../../src/learning-catalogue/model/learningTag/learningTag'
import {LearningTagService} from '../../../../src/learning-catalogue/service/learningTagService'
import {createApp} from '../../../utils/testApp'
import {TaxonomyTreeNode} from '../../../../src/lib/taxonomy/taxonomyTreeNode'
import {FormattedTaxonomyItem} from '../../../../src/lib/taxonomy/formattedTaxonomyItem'
import {PaginationService} from '../../../../src/lib/paginationService'
import {
	LearningTagCourseManagementController,
} from '../../../../src/controllers/learningTag/contentManagement/learningTagCourseManagementController'
import {
	LearningTagHyperlinksManagementController,
} from '../../../../src/controllers/learningTag/contentManagement/learningTagHyperlinkManagementControllerBase'

const session = require('supertest-session')
import sinonChai = require('sinon-chai')

chai.use(sinonChai)

describe('LearningTagContentManagement', () => {
	const pagination = new PaginationService()
	let learningTagService: sinon.SinonStubbedInstance<LearningTagService> = sinon.createStubInstance(LearningTagService)
	let courseController: LearningTagCourseManagementController = new LearningTagCourseManagementController(learningTagService as any, pagination)
	let hyperlinkController: LearningTagHyperlinksManagementController = new LearningTagHyperlinksManagementController(learningTagService as any, pagination)
	const app = createApp()
	app.use(courseController.path, courseController.buildRouter())
	app.use(hyperlinkController.path, hyperlinkController.buildRouter())
	const tag = new LearningTag()
	tag.name = "Learning Tag"
	tag.code = "LT01"
	tag.id = 1
	learningTagService.getLearningTag.withArgs("1").resolves(tag)

	learningTagService.getTree.withArgs(false).resolves(
		[
			new TaxonomyTreeNode("tag 1", 1, [
				new TaxonomyTreeNode("tag 2", 2, [], false)
			], false),
			new TaxonomyTreeNode("tag 3", 3, [], false)])
	learningTagService.getTree.withArgs(true).resolves(
		[
			new TaxonomyTreeNode("tag 1", 1, [
				new TaxonomyTreeNode("tag 2", 2, [], true)
			], true),
			new TaxonomyTreeNode("tag 3", 3, [], false)])
	const typeahead = [
		new FormattedTaxonomyItem(1, "tag 1", "TAG1"),
		new FormattedTaxonomyItem(2, "tag 2", "TAG2"),
		new FormattedTaxonomyItem(3, "tag 3", "TAG3")
	]
	learningTagService.getTypeahead.resolves(typeahead)

	describe('Remove courses from tag', () => {
		it('should revoke access if the admin does not have the required role', async () => {
			const request = session(app)
				.get('/content-management/learning-tags/1/courses')
				.set({"roles": 'LEARNING_TAG_MANAGER'})
			const res = await request.send()
			expect(res.status).to.eql(401)
		})
		it('should render the view courses page with courses and links tabs and pagination links with anchors', async () => {
			const coursesResponse: any = {
				results: [
					{
						id: "course-1",
						title: "Course 1",
						status: "Published"
					}
				],
				page: 0,
				size: 1,
				totalResults: 2
			}
			learningTagService.getCoursesPage.resolves(coursesResponse)

			const res = await session(app)
				.get('/content-management/learning-tags/1/courses')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send()

			expect(res.status).to.eql(200)
			expect(res.text).to.contain('Courses assigned to this tag')
			expect(res.text).to.contain('Links assigned to this tag')
			expect(res.text).to.contain('/content-management/learning-tags/1/courses')
			expect(res.text).to.contain('/content-management/learning-tags/1/hyperlinks')
			expect(res.text).to.contain('Course 1')
			expect(res.text).to.not.contain('BBC News')
			expect(res.text).to.contain('/content-management/learning-tags/1/courses?page=2')
			expect(res.text).to.not.contain('#courses')
			expect(res.text).to.contain('id="courses"')
			expect(res.text).to.not.contain('id="links"')
		})
		it('should remove multiple courses from the tag', async () => {
			learningTagService.removeCourses.resolves({successfulIds: ["course1", "course2"]})
			const res = await session(app)
				.post('/content-management/learning-tags/1/courses/remove')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					ids: ["course1", "course2"]
				})
			expect(learningTagService.removeCourses).to.have.been.calledWith(1, ["course1", "course2"])
			expect(res.status).to.eql(302)
		})
		it('should remove one course from the tag', async () => {
			learningTagService.removeCourses.resolves({successfulIds: ["course1"]})
			const res = await session(app)
				.post('/content-management/learning-tags/1/courses/remove/course1')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
			expect(learningTagService.removeCourses).to.have.been.calledWith(1, ["course1"])
			expect(res.status).to.eql(302)
		})
		it('should remove multiple hyperlinks from the tag', async () => {
			learningTagService.removeHyperlinks.resolves({successfulIds: ["1", "2"]})
			const res = await session(app)
				.post('/content-management/learning-tags/1/hyperlinks/remove')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					ids: ["1", "2"]
				})
			expect(learningTagService.removeHyperlinks).to.have.been.calledWith(1, ["1", "2"])
			expect(res.status).to.eql(302)
		})
		it('should remove one hyperlink from the tag', async () => {
			learningTagService.removeHyperlinks.resolves({successfulIds: ["1"]})
			const res = await session(app)
				.post('/content-management/learning-tags/1/hyperlinks/remove/1')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
			expect(learningTagService.removeHyperlinks).to.have.been.calledWith(1, ["1"])
			expect(res.status).to.eql(302)
		})
		it('should render error message and keep Courses tab selected when no courses are selected', async () => {
			const coursesResponse: any = {
				results: [
					{
						id: "course-1",
						title: "Course 1",
						status: "Published"
					}
				],
				page: 0,
				size: 10,
				totalResults: 1
			}
			const hyperlinksResponse: any = {
				results: [
					{
						id: 1,
						title: "BBC News",
						description: "News site",
						href: "https://bbc.co.uk"
					}
				],
				page: 0,
				size: 1,
				totalResults: 1
			}
			learningTagService.getCoursesPage.resolves(coursesResponse)
			learningTagService.getHyperlinksPage.resolves(hyperlinksResponse)

			const res = await session(app)
				.post('/content-management/learning-tags/1/courses/remove')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({})

			expect(res.status).to.eql(200)
			expect(res.text).to.contain('Select at least one course')
			expect(res.text).to.contain('Courses assigned to this tag')
			expect(res.text).to.contain('id="courses"')
			expect(res.text).to.not.contain('id="links"')
		})
		it('should keep Courses tab selected and display result message when courses are removed', async () => {
			const coursesResponse: any = {
				results: [],
				page: 0,
				size: 10,
				totalResults: 0
			}
			const hyperlinksResponse: any = {
				results: [],
				page: 0,
				size: 10,
				totalResults: 0
			}
			learningTagService.getCoursesPage.resolves(coursesResponse)
			learningTagService.getHyperlinksPage.resolves(hyperlinksResponse)
			learningTagService.removeCourses.resolves('2 courses were removed from this tag.')

			const agent = session(app)
			const postRes = await agent
				.post('/content-management/learning-tags/1/courses/remove')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					ids: ["course-1", "course-2"]
				})

			expect(postRes.status).to.eql(302)

			const getRes = await agent
				.get(postRes.header.location)
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send()

			expect(getRes.status).to.eql(200)
			expect(getRes.text).to.contain('2 courses were removed from this tag.')
			expect(getRes.text).to.contain('Courses assigned to this tag')
			expect(getRes.text).to.contain('id="courses"')
			expect(getRes.text).to.not.contain('id="links"')
		})
		it('should render error message and keep Links tab selected when no hyperlinks are selected', async () => {
			const coursesResponse: any = {
				results: [
					{
						id: "course-1",
						title: "Course 1",
						status: "Published"
					}
				],
				page: 0,
				size: 10,
				totalResults: 1
			}
			const hyperlinksResponse: any = {
				results: [
					{
						id: 1,
						title: "BBC News",
						description: "News site",
						href: "https://bbc.co.uk"
					}
				],
				page: 0,
				size: 1,
				totalResults: 1
			}
			learningTagService.getCoursesPage.resolves(coursesResponse)
			learningTagService.getHyperlinksPage.resolves(hyperlinksResponse)

			const res = await session(app)
				.post('/content-management/learning-tags/1/hyperlinks/remove')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({})

			expect(res.status).to.eql(200)
			expect(res.text).to.contain('Select at least one link')
			expect(res.text).to.contain('Links assigned to this tag')

		})
		it('should keep Links tab selected and display result message when links are removed', async () => {
			const coursesResponse: any = {
				results: [],
				page: 0,
				size: 10,
				totalResults: 0
			}
			const hyperlinksResponse: any = {
				results: [],
				page: 0,
				size: 10,
				totalResults: 0
			}
			learningTagService.getCoursesPage.resolves(coursesResponse)
			learningTagService.getHyperlinksPage.resolves(hyperlinksResponse)
			learningTagService.removeHyperlinks.resolves('2 links were removed from this tag.')

			const agent = session(app)
			const postRes = await agent
				.post('/content-management/learning-tags/1/hyperlinks/remove')
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send({
					ids: ["1", "2"]
				})

			expect(postRes.status).to.eql(302)
			expect(postRes.header.location).to.eql('/content-management/learning-tags/1/hyperlinks')

			const getRes = await agent
				.get(postRes.header.location)
				.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
				.send()

			expect(getRes.status).to.eql(200)
			expect(getRes.text).to.contain('2 links were removed from this tag.')
			expect(getRes.text).to.contain('Links assigned to this tag')
		})
	})
})