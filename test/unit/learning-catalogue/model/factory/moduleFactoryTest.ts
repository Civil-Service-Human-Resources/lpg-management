import {beforeEach, describe, it} from 'mocha'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {ModuleFactory} from '../../../../../src/learning-catalogue/model/factory/moduleFactory'
import {EventFactory} from '../../../../../src/learning-catalogue/model/factory/eventFactory'

chai.use(chaiAsPromised)

describe('ModuleFactory tests', () => {
	let eventFactory: EventFactory
	let moduleFactory: ModuleFactory
	let data: any

	beforeEach(() => {
		eventFactory = new EventFactory()

		moduleFactory = new ModuleFactory(eventFactory)

		data = {
			id: 'MBlZJv-ZRDCYZsCByjzRuQ',
			title: 'module title',
			description: 'module description',
			url: 'module url',
			duration: 3600,
			price: 100,
		}
	})

	const testProperties = (module: any, data: any, exclude: string[] = []) => {
		for (const property in module) {
			if (exclude.includes(property)) {
				continue
			}

			expect(module[property]).to.deep.equal(data[property])
		}
	}

	it('should create LinkModule', async () => {
		data.url = 'http://example.org'
		data.type = 'link'
		data.moduleTitle = 'module title'
		data.description = 'this a description'

		const module = await moduleFactory.create(data)

		testProperties(module, data)
	})

	it('should create ELearningModule', async () => {
		data.startPage = 'start-page'
		data.type = 'elearning'

		const module = await moduleFactory.create(data)

		testProperties(module, data)

		expect(module.startPage).to.equal(data.startPage)
	})

	it('should create FaceToFaceModule', async () => {
		data.type = 'face-to-face'
		data.productCode = 'product-code'
		data.events = [
			{
				id: 'XEbjXzmVQwSQ_7qIvr7Kew',
				venue: {
					location: 'London',
					address: 'SE1',
					capacity: 99,
					minCapacity: 10,
				},
				dateRanges: [{date: '2019-01-01', startTime: '09:00:00', endTime: '17:00:00'}],
			},
		]

		const module = await moduleFactory.create(data)

		testProperties(module, data, ['events'])

		testProperties(module.events[0], data.events[0], ['date'])

		expect(module.events[0].dateRanges[0].date).to.be.equal('2019-01-01')
		expect(module.events[0].dateRanges[0].startTime).to.be.equal('09:00:00')
		expect(module.events[0].dateRanges[0].endTime).to.be.equal('17:00:00')
	})

	it('should set events to empt lists of missing', async () => {
		data.type = 'face-to-face'
		data.productCode = 'product-code'

		const module = await moduleFactory.create(data)

		testProperties(module, data, ['events'])

		expect(module.events).to.eql([])
	})

	it('should create FileModule', async () => {
		data.type = 'file'
		data.fileSize = 99
		data.url = 'http://example.org'

		const module = await moduleFactory.create(data)

		testProperties(module, data)
	})

	it('should create VideoModule', async () => {
		data.type = 'video'
		data.location = 'http://example.org'

		const module = await moduleFactory.create(data)

		testProperties(module, data)
	})

	it('should throw error if type is not recognised', async () => {
		data.type = 'unknown'
		expect(function() {
			moduleFactory.create(data)
		}).to.throw(`Unknown module type: unknown ${JSON.stringify(data)}`)
	})
})
