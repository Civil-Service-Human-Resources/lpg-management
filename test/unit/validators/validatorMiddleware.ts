import {IsNotEmpty} from 'class-validator'
import {BehaviourOnError, validateEndpoint} from '../../../src/validators/validatorMiddleware'
import {NextFunction} from 'express'
import {expect} from 'chai'
// import {expect} from 'chai'

class TestObject {
	@IsNotEmpty({
		message: 'notEmpty'
	})
	public value: String
}

describe('Validation middleware tests', () => {
	let redirectVal = ""
	let renderVal = ""
	let statusVal = 0
	let req = {
		originalUrl: '/request',
		session: {
			sessionFlash: {
				errors: {}
			},
			save: (cb: () => {}) => {cb()}
		},
		body: {},
		params: {}
	}
	let res = {
		locals: {
			input: {}
		},
		redirect: (redirect: string) => {redirectVal = redirect},
		render: (template: string) => {renderVal = template},
		status: (status: number) => {statusVal = status}
	}
	let next: NextFunction = () => {}
	it('Should validate an object and redirect', async () => {
		req.body = {value: ""}
		req.params = {
			paramOne: 'paramOneVal'
		}
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.REDIRECT,
				path: '/:paramOne'
			}
		})
		await func(req as any, res as any, next)
		const errors: any = req.session!.sessionFlash.errors
		expect(errors.fields.value[0]).to.eql('notEmpty')
		expect(redirectVal).to.eql('/paramOneVal')
	})

	it('Should validate an object and redirect to the original request URL', async () => {
		req.body = {value: ""}
		req.params = {
			paramOne: 'paramOneVal'
		}
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.REDIRECT
			}
		})
		await func(req as any, res as any, next)
		const errors: any = req.session!.sessionFlash.errors
		expect(errors.fields.value[0]).to.eql('notEmpty')
		expect(redirectVal).to.eql('/request')
	})

	it('Should validate an object and render a template', async () => {
		req.body = {value: ""}
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.RENDER_TEMPLATE,
				path: 'path'
			}
		})
		await func(req as any, res as any, next)
		const errors: any = req.session!.sessionFlash.errors
		expect(errors.fields.value[0]).to.eql('notEmpty')
		expect(renderVal).to.eql('path')
		expect(statusVal).to.eql(400)
	})

	it('Should pass the request on when the object is valid', async () => {
		req.body = {value: "stringValue"}
		const func = validateEndpoint({
			dtoClass: TestObject,
			onError: {
				behaviour: BehaviourOnError.RENDER_TEMPLATE,
				path: 'path'
			}
		})
		await func(req as any, res as any, next)
		const input: any = res.locals.input
		expect(input.value).to.eql("stringValue")
	})
})
