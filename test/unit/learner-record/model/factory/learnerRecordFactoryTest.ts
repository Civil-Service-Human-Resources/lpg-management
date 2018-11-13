import {expect} from 'chai'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinonChai from 'sinon-chai'
import {LearnerRecordEventFactory} from '../../../../../src/learner-record/model/factory/learnerRecordEventFactory'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Learner Record Factory tests', () => {
	let eventFactory: LearnerRecordEventFactory

	beforeEach(() => {
		eventFactory = new LearnerRecordEventFactory()
	})

	it('should create learner record event from data', () => {
		const data = {
			id: 1,
			eventUid: 'test-event-uid',
			path: 'test/path',
		}

		const learnerRecordEvent = eventFactory.create(data)

		expect(learnerRecordEvent.id).to.equal(1)
		expect(learnerRecordEvent.eventUid).to.equal('test-event-uid')
		expect(learnerRecordEvent.path).to.equal('test/path')
	})
})
