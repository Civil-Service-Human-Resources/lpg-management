import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinonChai from 'sinon-chai'
import {expect} from 'chai'
import {LearnerRecordEvent} from '../../../../src/learner-record/model/learnerRecordEvent'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('LearnerRecordEvent tests', () => {
	let learnerRecordEvent: LearnerRecordEvent

	beforeEach(() => {
		learnerRecordEvent = new LearnerRecordEvent()
	})

	it('should be able to set id', () => {
		learnerRecordEvent.id = 1
		expect(learnerRecordEvent.id).to.equal(1)
	})

	it('should be able to set eventUid', () => {
		learnerRecordEvent.eventUid = 'test-event-uid'
		expect(learnerRecordEvent.eventUid).to.equal('test-event-uid')
	})

	it('should be able to set path', () => {
		learnerRecordEvent.path = 'test-path'
		expect(learnerRecordEvent.path).to.equal('test-path')
	})
})
