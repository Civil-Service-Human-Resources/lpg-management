import {Controller} from '../../../src/controllers/controller'
import {NextFunction, Request, Response} from 'express'
import {getRequest, postRequest, Route} from '../../../src/controllers/route'
import {BehaviourOnError} from '../../../src/validators/validatorMiddleware'
import {expect} from 'chai'
import * as express from 'express'

class TestController extends Controller {

	constructor() {
		super("/testController", "testController")
	}

	protected getControllerMiddleware(): ((req: Request, res: Response, next: NextFunction) => void)[] {
		return []
	}


	protected getRoutes(): Route[] {
		return [
			getRequest("/get",() => {}),
			postRequest("/post", (req, res, next) => {
				console.log("POST")
				res.send(200)
			},{
				dtoClass: String,
				onError: {
					behaviour: BehaviourOnError.REDIRECT,
					path: "redirect"
				}
			})
		]
	}
}


describe('Controller tests', () => {
	const app = express()
	const controller = new TestController()
	const router = controller.buildRouter()
	app.use(controller.path, router)
	describe('Build tests', () => {
		it('Should build the router using the provided endpoints', () => {
			expect(router.stack[0].route.path).to.eql("/get")
			expect(router.stack[1].route.path).to.eql("/post")
		})
	})
})
