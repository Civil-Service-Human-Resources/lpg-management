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

describe('OrganisationalUnit', () => {
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
})