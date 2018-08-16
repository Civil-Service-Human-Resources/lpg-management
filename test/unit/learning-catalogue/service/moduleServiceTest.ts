import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import {ModuleService} from '../../../../src/learning-catalogue/service/moduleService'
import {RestService} from '../../../../src/learning-catalogue/service/restService'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {Module} from '../../../../src/learning-catalogue/model/module'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('ModuleService tests', () => {
	const courseId = 'course-id'
	let moduleService: ModuleService
	let restService: RestService
	let moduleFactory: ModuleFactory

	const path: string = `/courses/${courseId}/modules`

	beforeEach(() => {
		moduleFactory = <ModuleFactory>{}
		restService = <RestService>{}
		moduleService = new ModuleService(restService)
		moduleService.moduleFactory = moduleFactory
	})

	it('should get module', async () => {
		const courseId = 'course-id'
		const moduleId: string = 'module-id'
		const path = `/courses/${courseId}/modules/${moduleId}`

		const data = {
			id: moduleId,
		}

		const module = <Module>{
			id: moduleId,
		}

		restService.get = sinon
			.stub()
			.withArgs(path)
			.returns(data)

		moduleFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(module)

		expect(await moduleService.get(courseId, moduleId)).to.eql(module)
		expect(restService.get).to.have.been.calledOnceWith(path)
		expect(moduleFactory.create).to.have.been.calledOnceWith(data)
	})

	it('should create module', async () => {
		const courseId = 'course-id'
		const moduleId: string = 'module-id'

		const data = {
			id: moduleId,
		}

		const module = <Module>{
			id: moduleId,
		}

		restService.post = sinon
			.stub()
			.withArgs(path, module)
			.returns(data)
		moduleFactory.create = sinon
			.stub()
			.withArgs(data)
			.returns(module)

		expect(await moduleService.create(courseId, module)).to.eql(module)
		expect(restService.post).to.have.been.calledOnceWith(path, module)
		expect(moduleFactory.create).to.have.been.calledOnceWith(data)
	})
})
