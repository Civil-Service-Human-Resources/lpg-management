import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {expect} from 'chai'

import {Validate} from '../../../src/controllers/formValidator'
import {FormController} from '../../../src/controllers/formController'
import {Course} from '../../../src/learning-catalogue/model/course'
import {Validator} from '../../../src/learning-catalogue/validator/validator'
import {Factory} from '../../../src/learning-catalogue/model/factory/factory'
import {mockReq, mockRes} from 'sinon-express-mock'

chai.use(sinonChai)

describe('formValidatorTests', () => {
	const fields = ['field1', 'field2']
	const redirect = 'http://example.org'

	it('should save errors and form data to session of validation fails', async () => {
		const decoratorCallback = Validate({
			fields: fields,
			redirect: redirect,
		})

		const controller = <FormController>{
			validator: <Validator<Course>>{
				factory: <Factory<Course>>{},
				check: sinon.stub(),
			},
			createCourseTitle: sinon.stub(),
		}

		const errors = {
			size: 1,
			fields: [
				{
					field1: ['field.message'],
				},
			],
		}

		const originalMethod = sinon.stub()

		const descriptor = decoratorCallback(controller, 'createCourseTitle', {
			value: () => {
				return originalMethod
			},
			validator: <Validator<Course>>{
				factory: <Factory<Course>>{},
				check: sinon.stub().returns(errors),
			},
		})

		const validationMiddleware = descriptor.value({
			fields: fields,
			redirect: redirect,
		})

		const request = mockReq({
			body: {
				data: 'Hello World!',
			},
			session: {
				save: (callback: any) => {
					callback()
				},
			},
		})

		const response = mockRes()

		await validationMiddleware(request, response)

		expect(originalMethod).to.not.have.been.called
		expect(descriptor.validator.check).to.have.been.calledOnceWith(request.body, fields)
		expect(response.redirect).to.have.been.calledOnceWith(redirect)
		expect(request.session!.sessionFlash).to.eql({
			errors: errors,
			form: request.body,
		})
	})

	it('should call decorated method if validation passes', async () => {
		const decoratorCallback = Validate({
			fields: fields,
			redirect: redirect,
		})

		const controller = <FormController>{
			validator: <Validator<Course>>{
				factory: <Factory<Course>>{},
				check: sinon.stub(),
			},
			createCourseTitle: sinon.stub(),
		}

		const errors = {
			size: 0,
			fields: [],
		}

		const originalMethod = sinon.stub()

		const descriptor = decoratorCallback(controller, 'createCourseTitle', {
			value: () => {
				return originalMethod
			},
			validator: <Validator<Course>>{
				factory: <Factory<Course>>{},
				check: sinon.stub().returns(errors),
			},
		})

		const validationMiddleware = descriptor.value({
			fields: fields,
			redirect: redirect,
		})

		const request = mockReq({
			body: {
				data: 'Hello World!',
			},
			session: {
				save: (callback: any) => {
					callback()
				},
			},
		})

		const response = mockRes()

		await validationMiddleware(request, response)

		expect(descriptor.validator.check).to.have.been.calledOnceWith(request.body, fields)
		expect(originalMethod).to.have.been.calledOnce
		expect(response.redirect).to.not.have.been.called
	})
})
