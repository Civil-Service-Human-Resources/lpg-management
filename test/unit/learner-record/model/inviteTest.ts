import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinonChai from 'sinon-chai'
import {Invite} from '../../../../src/learner-record/model/invite'
import {expect} from 'chai'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Invite tests', () => {
	let invite: Invite

	beforeEach(() => {
		invite = new Invite()
	})

	it('should be able to set id', () => {
		invite.id = 1
		expect(invite.id).to.equal(1)
	})

	it('should be able to set learnerEmail', () => {
		invite.learnerEmail = 'test@test.com'
		expect(invite.learnerEmail).to.equal('test@test.com')
	})

	it('should be able to set event', () => {
		invite.event = 'test/path/to/event'
		expect(invite.event).to.equal('test/path/to/event')
	})
})
