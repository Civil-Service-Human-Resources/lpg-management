import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {LinkFactory} from '../../../../src/learning-catalogue/model/factory/linkFactory'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {LinkModuleController} from '../../../../src/controllers/module/linkModuleController'
import {expect} from 'chai'
import sinon = require('sinon')
import {CourseService} from 'lib/courseService'
import {LinkModule} from '../../../../src/learning-catalogue/model/linkModule'
import {NextFunction} from 'express'

chai.use(sinonChai)

describe('LinkModuleController tests', () => {
	let learningCatalogue: LearningCatalogue
	let linkFactory: LinkFactory
	let moduleValidator: Validator<LinkModule>
	let controller: LinkModuleController
	let courseService: CourseService
	let next: NextFunction

	before(() => {
		learningCatalogue = <LearningCatalogue>{}
		linkFactory = <LinkFactory>{}
		moduleValidator = <Validator<LinkModule>>{}

		controller = new LinkModuleController(learningCatalogue, linkFactory, moduleValidator, courseService)

		next = sinon.stub()
	})

	it('should render add link module template', async () => {
		const request = mockReq()
		const response = mockRes()

		await controller.addLinkModule()(request, response)

		return expect(response.render).to.have.been.calledOnceWith('page/course/module/module-link')
	})

	it('should validate title, description, url and duration and render errors', async () => {
		const request = mockReq({
			body: {
				isOptional: true,
			},
		})
		const response = mockRes()

		const errors = {size: 3, fields: []}

		moduleValidator.check = sinon.stub().returns(errors)
		linkFactory.create = sinon.stub()
		learningCatalogue.createModule = sinon.stub().returns(Promise.resolve(module))

		await controller.setLinkModule()(request, response, next)

		expect(linkFactory.create).to.not.have.been.called
		expect(learningCatalogue.createModule).to.not.have.been.called
		expect(moduleValidator.check).to.have.been.calledOnceWith(
			{
				duration: 0,
				isOptional: true,
				type: 'link',
			},
			['title', 'description', 'url', 'duration']
		)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/module-link', {
			module: {
				duration: 0,
				isOptional: true,
				type: 'link',
			},
			errors: errors,
		})
	})

	it('should redirect to add module page on success', async () => {
		const course = {
			id: 'course-id',
		}

		const data = {
			isOptional: true,
			title: 'Module title',
			description: 'Module description',
			url: 'http://example.org',
			hours: 1,
			minutes: 30,
		}

		const request = mockReq({
			body: data,
		})
		const response = mockRes({
			locals: {
				course: course,
			},
		})

		const errors = {size: 0, fields: []}

		const linkModule = {
			isOptional: true,
			title: 'Module title',
			description: 'Module description',
			url: 'http://example.org',
			type: 'link',
			duration: 5400,
		}

		moduleValidator.check = sinon.stub().returns(errors)
		learningCatalogue.createModule = sinon.stub().returns(Promise.resolve(module))

		linkFactory.create = sinon.stub().returns(linkModule)

		await controller.setLinkModule()(request, response, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(
			{
				isOptional: true,
				title: 'Module title',
				description: 'Module description',
				url: 'http://example.org',
				hours: 1,
				minutes: 30,
				type: 'link',
				duration: 5400,
			},
			['title', 'description', 'url', 'duration']
		)

		expect(linkFactory.create).to.have.been.calledOnceWith({
			isOptional: true,
			title: 'Module title',
			description: 'Module description',
			url: 'http://example.org',
			hours: 1,
			minutes: 30,
			type: 'link',
			duration: 5400,
		})

		expect(learningCatalogue.createModule).to.have.been.calledOnceWith(course.id, linkModule)

		expect(response.render).to.not.have.been.called

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/add-module`)
	})

	it('should redirect to add module page on update success', async () => {
		const course = {
			id: 'course-id',
		}

		const data = {
			isOptional: true,
			title: 'Module title',
			description: 'Module description',
			url: 'http://example.org',
			hours: 1,
			minutes: 30,
		}

		const request = mockReq({
			body: data,
		})
		const response = mockRes({
			locals: {
				course: course,
			},
		})

		const errors = {size: 0, fields: []}

		const linkModule = {
			isOptional: true,
			title: 'Module title',
			description: 'Module description',
			url: 'http://example.org',
			type: 'link',
			duration: 5400,
		}

		response.locals.module = linkModule

		moduleValidator.check = sinon.stub().returns(errors)
		learningCatalogue.updateModule = sinon.stub().returns(Promise.resolve(linkModule))

		await controller.updateLinkModule()(request, response, next)

		expect(moduleValidator.check).to.have.been.calledOnceWith(linkModule, ['title', 'description', 'url', 'duration'])

		expect(learningCatalogue.updateModule).to.have.been.calledOnceWith(course.id, linkModule)

		expect(response.render).to.not.have.been.called

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${course.id}/add-module`)
	})

	it('should render link module screen if update fails validation', async () => {
		const request = mockReq({
			body: {
				isOptional: true,
			},
		})
		const response = mockRes()

		const errors = {size: 3, fields: []}

		const linkModule = {
			isOptional: true,
			duration: 5400,
		}

		response.locals.module = linkModule

		moduleValidator.check = sinon.stub().returns(errors)
		linkFactory.create = sinon.stub()
		learningCatalogue.updateModule = sinon.stub().returns(Promise.resolve(linkModule))

		await controller.updateLinkModule()(request, response, next)

		expect(linkFactory.create).to.not.have.been.called
		expect(learningCatalogue.updateModule).to.not.have.been.called
		expect(moduleValidator.check).to.have.been.calledOnceWith(linkModule, ['title', 'description', 'url', 'duration'])

		expect(response.render).to.have.been.calledOnceWith('page/course/module/module-link', {
			module: linkModule,
			errors: errors,
		})
	})
})
