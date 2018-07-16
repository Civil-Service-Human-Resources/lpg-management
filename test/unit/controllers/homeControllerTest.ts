import {describe, it} from 'mocha'
import {HomeController} from '../../../src/controllers/home'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {Request, Response} from 'express'

chai.use(sinonChai)

describe('Home Controller Tests', function() {
	let homeController: HomeController

	beforeEach(() => {
		homeController = new HomeController()
	})

	it('should render index template', function() {
		const index: (
			request: Request,
			response: Response
		) => void = homeController.index()
		const request: Request = mockReq()
		const reponse: Response = mockRes()

		index(request, reponse)

		expect(reponse.render).to.have.been.calledOnceWith('page/index')
	})
})
