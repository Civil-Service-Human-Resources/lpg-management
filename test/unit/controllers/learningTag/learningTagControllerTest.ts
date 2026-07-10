import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {LearningTag} from '../../../../src/learning-catalogue/model/learningTag/learningTag'
import {LearningTagService} from '../../../../src/learning-catalogue/service/learningTagService'
import {getApp} from '../../../utils/testApp'
import {LearningTagController} from '../../../../src/controllers/learningTag/learningTagController'
import {TaxonomyTreeNode} from '../../../../src/lib/taxonomy/taxonomyTreeNode'
import {FormattedTaxonomyItem} from '../../../../src/lib/taxonomy/formattedTaxonomyItem'
import {LearningTagPageModel} from '../../../../src/controllers/learningTag/model/learningTagPageModel'

const session = require('supertest-session')
import sinonChai = require('sinon-chai')

chai.use(sinonChai)

describe('LearningTag', () => {
	let learningTagService: sinon.SinonStubbedInstance<LearningTagService> = sinon.createStubInstance(LearningTagService)
	let controller: LearningTagController = new LearningTagController(learningTagService as any)
	const app = getApp()
	app.use(controller.path, controller.buildRouter())
	const tag = new LearningTag()
	tag.name = "Learning Tag"
	tag.code = "LT01"
	tag.id = 1
	learningTagService.getLearningTag.withArgs("1").resolves(tag)

	learningTagService.getTree.resolves(
		[
			new TaxonomyTreeNode("tag 1", 1, [
				new TaxonomyTreeNode("tag 2", 2, [])
			]),
			new TaxonomyTreeNode("tag 3", 3, [])])
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
				expect(res.status).to.eql(200)
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
	})
})