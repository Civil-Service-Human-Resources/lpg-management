import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {LearningTag} from '../../../../src/learning-catalogue/model/learningTag/learningTag'
import {LearningTagService} from '../../../../src/learning-catalogue/service/learningTagService'
import {createApp} from '../../../utils/testApp'
import {LearningTagController} from '../../../../src/controllers/learningTag/learningTagController'
import {TaxonomyTreeNode} from '../../../../src/lib/taxonomy/taxonomyTreeNode'
import {FormattedTaxonomyItem} from '../../../../src/lib/taxonomy/formattedTaxonomyItem'
import {LearningTagPageModel} from '../../../../src/controllers/learningTag/model/learningTagPageModel'
import {PaginationService} from '../../../../src/lib/paginationService'

const session = require('supertest-session')
import sinonChai = require('sinon-chai')

chai.use(sinonChai)

describe('LearningTag', () => {
	let learningTagService: sinon.SinonStubbedInstance<LearningTagService> = sinon.createStubInstance(LearningTagService)
	let controller: LearningTagController = new LearningTagController(learningTagService as any, new PaginationService())
	const app = createApp()
	app.use(controller.path, controller.buildRouter())
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

	describe('Manage', () => {
		it('should render the learning tag tree', async () => {
			const request = session(app)
				.get('/content-management/learning-tags/manage')
				.set({"roles": 'LEARNING_TAG_MANAGER'})
			const res = await request.send()
			expect(res.status).to.eql(200)
		})
	})
	describe('Overview', () => {
		it('should fetch the view learning tag overview page', async () => {
			const request = session(app)
				.get('/content-management/learning-tags/1/overview')
				.set({"roles": 'LEARNING_TAG_MANAGER'})
			const res = await request.send()
			expect(res.status).to.eql(200)
		})
	})
	describe('Add learning tag', () => {
		describe('Get', () => {
			it('should load the page correctly', async () => {
				const res = await session(app)
					.get('/content-management/learning-tags')
					.set({"roles": 'LEARNING_TAG_MANAGER'})
					.send()
				expect(res.status).to.eql(200)
			})
		})
		describe('Create', () => {
			it('should add a new learning tag', async () => {
				const learningTag = new LearningTag()
				learningTag.name = "Learning tag 2"
				learningTag.code = "LT"
				learningTag.id = 2
				learningTagService.create.resolves(learningTag)
				const body = {
					name: "Learning tag 2",
					code: "LT"
				}
				const request = session(app)
					.post('/content-management/learning-tags/')
					.set({"roles": 'LEARNING_TAG_MANAGER'})
				const res = await request.send(body)
				expect(res.status).to.eql(302)
				expect(learningTagService.create).to.be.calledOnce
			})
			describe('basic validation', () => {
				it('should validate missing properties', async () => {
					const body = {
						"name": "",
						"code": ""
					}
					const request = session(app)
						.post('/content-management/learning-tags/')
						.set({"roles": 'LEARNING_TAG_MANAGER'})
					const res = await request.send(body)
					expect(res.status).to.eql(200)
					expect(res.text).to.contain('Tag name is required')
					expect(res.text).to.contain('Tag code is required')
				})
				it('should validate invalid url slug', async () => {
					const body = {
						"name": "Test",
						"code": "TEST",
						"urlSlug": "$$invalid"
					}
					const request = session(app)
						.post('/content-management/learning-tags/')
						.set({"roles": 'LEARNING_TAG_MANAGER'})
					const res = await request.send(body)
					expect(res.status).to.eql(200)
					expect(res.text).to.contain('Unique URL is not in the correct format')
				})
			})
			describe('advanced validation', () => {
				const pageModel = new LearningTagPageModel(typeahead)
				pageModel.name = "tag 1"
				pageModel.name = "TAG1"
				learningTagService.getPageModel.resolves(pageModel)
				it('should validate name and code that already exist', async () => {
					const body = {
						"name": "tag 1",
						"code": "TAG1"
					}
					const request = session(app)
						.post('/content-management/learning-tags/')
						.set({"roles": 'LEARNING_TAG_MANAGER'})
					const res = await request.send(body)
					expect(res.status).to.eql(200)
					expect(res.text).to.contain('A tag with this name already exists')
					expect(res.text).to.contain('A tag with this code already exists')
					expect(res.text).to.contain('Add a new tag')
				})
			})
		})
		describe('Edit', () => {
			describe('advanced validation', () => {
				it('should validate name and code that already exist', async () => {
					const pageModel = new LearningTagPageModel(typeahead)
					pageModel.name = "tag 2"
					pageModel.code = "TAG2"
					learningTagService.getPageModel.resolves(pageModel)
					const body = {
						"name": "tag 2",
						"code": "TAG2"
					}
					const request = session(app)
						.post('/content-management/learning-tags/1')
						.set({"roles": 'LEARNING_TAG_MANAGER'})
					const res = await request.send(body)
					expect(res.status).to.eql(200)
					expect(res.text).to.contain('A tag with this name already exists')
					expect(res.text).to.contain('A tag with this code already exists')
				})
				it('should validate no self-reference for parent', async () => {
					learningTagService.getPageModel.resolves()
					const body = {
						"name": "tag 1",
						"code": "TAG1",
						"parentId": 1
					}
					const request = session(app)
						.post('/content-management/learning-tags/1')
						.set({"roles": 'LEARNING_TAG_MANAGER'})
					const res = await request.send(body)
					expect(res.status).to.eql(200)
					expect(res.text).to.contain('A learning tag cannot be its own parent')
				})
			})
		})
		describe('Archive/unarchive', () => {
			it('should validate the correct role', async () => {
				const request = session(app)
					.get('/content-management/learning-tags/1/archive-confirm')
					.set({"roles": 'LEARNING_TAG_MANAGER'})
				const res = await request.send()
				expect(res.status).to.eql(401)
			})
			it('should archive', async () => {
				learningTagService.archive.resolves({})
				const request = session(app)
					.post('/content-management/learning-tags/1/archive')
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_ARCHIVE'})
				const res = await request.send()
				expect(res.status).to.eql(302)
				expect(learningTagService.archive).to.be.calledOnce
			})
			it('should unarchive', async () => {
				learningTagService.unarchive.resolves({})
				const request = session(app)
					.post('/content-management/learning-tags/1/unarchive')
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_ARCHIVE'})
				const res = await request.send()
				expect(res.status).to.eql(302)
				expect(learningTagService.unarchive).to.be.calledOnce
			})
		})
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
					totalResults: 2
				}
				learningTagService.getCoursesPage.resolves(coursesResponse)
				learningTagService.getHyperlinksPage.resolves(hyperlinksResponse)

				const res = await session(app)
					.get('/content-management/learning-tags/1/courses')
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
					.send()

				expect(res.status).to.eql(200)
				expect(res.text).to.contain('Courses assigned to this tag')
				expect(res.text).to.contain('Links assigned to this tag')
				expect(res.text).to.contain('/content-management/learning-tags/1/courses')
				expect(res.text).to.contain('/content-management/learning-tags/1/courses?linkPage=1')
				expect(res.text).to.contain('Course 1')
				expect(res.text).to.not.contain('BBC News')
				expect(res.text).to.contain('/content-management/learning-tags/1/courses?coursePage=2')
				expect(res.text).to.not.contain('#courses')
				expect(res.text).to.contain('id="courses"')
				expect(res.text).to.not.contain('id="links"')
			})
			it('should render the links page when navigating to page 2 of links', async () => {
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
							id: 2,
							title: "BBC News Page 2",
							description: "News site",
							href: "https://bbc.co.uk"
						}
					],
					page: 1,
					size: 1,
					totalResults: 2
				}
				learningTagService.getCoursesPage.resolves(coursesResponse)
				learningTagService.getHyperlinksPage.resolves(hyperlinksResponse)

				const res = await session(app)
					.get('/content-management/learning-tags/1/courses?linkPage=2')
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
					.send()

				expect(res.status).to.eql(200)
				expect(learningTagService.getCoursesPage).to.be.calledWith(1, sinon.match({p: 0, coursePage: 0}))
				expect(learningTagService.getHyperlinksPage).to.be.calledWith(1, sinon.match({p: 1, linkPage: 1}))
				expect(res.text).to.contain('Courses assigned to this tag')
				expect(res.text).to.contain('Links assigned to this tag')
				expect(res.text).to.contain('/content-management/learning-tags/1/courses')
				expect(res.text).to.contain('/content-management/learning-tags/1/courses?linkPage=1')
				expect(res.text).to.contain('BBC News Page 2')
				expect(res.text).to.contain('https://bbc.co.uk')
				expect(res.text).to.contain('Go to BBC News Page 2 (opens in a new tab)')
				expect(res.text).to.contain('/content-management/learning-tags/1/hyperlinks/remove')
				expect(res.text).to.not.contain('Course 1')
				expect(res.text).to.not.contain('#links')
				expect(res.text).to.contain('id="links"')
				expect(res.text).to.not.contain('id="courses"')
			})
			it('should remove multiple courses from the tag', async () => {
				learningTagService.removeCourses.resolves({successfulIds: ["course1", "course2"]})
				const res = await session(app)
					.post('/content-management/learning-tags/1/courses/remove')
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
					.send({
						courseIds: ["course1", "course2"]
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
						hyperlinkIds: ["1", "2"]
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
				learningTagService.removeCourses.resolves({successfulIds: ["course-1", "course-2"]})

				const agent = session(app)
				const postRes = await agent
					.post('/content-management/learning-tags/1/courses/remove')
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
					.send({
						courseIds: ["course-1", "course-2"]
					})

				expect(postRes.status).to.eql(302)
				expect(postRes.header.location).to.eql('/content-management/learning-tags/1/courses')

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
				expect(res.text).to.contain('id="links"')
				expect(res.text).to.not.contain('id="courses"')
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
				learningTagService.removeHyperlinks.resolves({successfulIds: ["1", "2"]})

				const agent = session(app)
				const postRes = await agent
					.post('/content-management/learning-tags/1/hyperlinks/remove')
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
					.send({
						hyperlinkIds: ["1", "2"]
					})

				expect(postRes.status).to.eql(302)
				expect(postRes.header.location).to.eql('/content-management/learning-tags/1/courses?linkPage=1')

				const getRes = await agent
					.get(postRes.header.location)
					.set({"roles": 'LEARNING_TAG_MANAGER,LEARNING_TAG_COURSE_MANAGER'})
					.send()

				expect(getRes.status).to.eql(200)
				expect(getRes.text).to.contain('2 links were removed from this tag.')
				expect(getRes.text).to.contain('Links assigned to this tag')
				expect(getRes.text).to.contain('id="links"')
				expect(getRes.text).to.not.contain('id="courses"')
			})
		})
	})
})