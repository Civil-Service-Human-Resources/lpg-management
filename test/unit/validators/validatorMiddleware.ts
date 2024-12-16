import {IsNotEmpty} from 'class-validator'
import {BehaviourOnError, validateEndpoint} from '../../../src/validators/validatorMiddleware'
import {NextFunction, Request, Response} from 'express'
import {mockReq, mockRes} from 'sinon-express-mock'
import {expect} from 'chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {beforeEach} from 'mocha'
import {SubmittableForm} from '../../../src/controllers/models/submittableForm'

class TestObject extends SubmittableForm {
	@IsNotEmpty({
		message: 'notEmpty'
	})
	public value: String
}

chai.use(sinonChai)

describe('Validation middleware tests', () => {
	let request: Request
	let response: Response
	let next: NextFunction

	beforeEach(() => {
		request = mockReq()
		response = mockRes()
		request.session!.save = callback => {
			callback(undefined)
		}
		request.session!.sessionFlash = {}
		next = sinon.stub()
	})

	it('Should validate an object and redirect', async () => {
		request.body = {value: ""}
		request.params = {
			paramOne: 'paramOneVal'
		}
		const pageModelKey = 'pageModelKey'
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.REDIRECT,
				path: '/:paramOne',
				pageModelKey
			}
		})
		await func(request, response, next)
		const errors: any = request.session![pageModelKey].errors
		expect(errors.fields.value[0]).to.eql('notEmpty')
		expect(response.redirect).to.have.been.calledOnceWith('/paramOneVal')
	})

	it('Should validate an object and redirect to the original request URL', async () => {
		request.body = {value: ""}
		request.params = {
			paramOne: 'paramOneVal'
		}
		request.originalUrl = '/request'
		const pageModelKey = 'pageModelKey'
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.REDIRECT,
				pageModelKey
			}
		})
		await func(request, response, next)
		const errors: any = request.session![pageModelKey].errors
		expect(errors.fields.value[0]).to.eql('notEmpty')
		expect(response.redirect).to.have.been.calledOnceWith('/request')
	})

	it('Should validate an object and render a template', async () => {
		request.body = {value: ""}
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.RENDER_TEMPLATE,
				path: 'path'
			}
		})
		await func(request, response, next)
		expect(response.render).to.have.been.calledOnceWith('path')
		expect(response.status).to.have.been.calledOnceWith(400)
	})

	it('Should pass the request on when the object is valid', async () => {
		request.body = {value: "stringValue"}
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.RENDER_TEMPLATE,
				path: 'path'
			}
		})
		await func(request, response, next)
		const input: any = response.locals.input
		expect(input.value).to.eql("stringValue")
	})
})
