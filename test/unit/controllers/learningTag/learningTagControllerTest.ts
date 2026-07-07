import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {LearningTag} from '../../../../src/learning-catalogue/model/learningTag/learningTag'
import {LearningTagService} from '../../../../src/learning-catalogue/service/learningTagService'
import {getApp} from '../../../utils/testApp'
import {LearningTagController} from '../../../../src/controllers/learningTag/learningTagController'
import {TaxonomyTreeNode} from '../../../../src/lib/taxonomy/taxonomyTreeNode'

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
	learningTagService.getLearningTag.withArgs("1").resolves(tag)

	learningTagService.getTree.resolves(
		[
			new TaxonomyTreeNode("tag 1", 1, [
				new TaxonomyTreeNode("tag 2", 2, [])
			]),
			new TaxonomyTreeNode("tag 3", 3, [])])

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
			// it('should add a new learning tag', async () => {
			// 	const learningTag = new LearningTag()
			// 	learningTag.name = "Learning tag 2"
			// 	learningTag.code = "LT"
			// 	learningTag.id = 2
			// 	learningTagService.create.resolves(learningTag)
			// 	const body = {
			// 		name: "Learning tag 2",
			// 		code: "LT"
			// 	}
			// 	const request = session(app)
			// 		.post('/content-management/learning-tags/')
			// 		.set({"roles": 'LEARNING_TAG_MANAGER'})
			// 	const res = await request.send(body)
			// 	expect(res.status).to.eql(200)
			// 	expect(learningTagService.create).to.be.calledOnce
			// })
			describe('validation', () => {
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
		})

	})
})