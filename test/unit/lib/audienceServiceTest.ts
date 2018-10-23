import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {describe} from 'mocha'
import {Audience} from '../../../src/learning-catalogue/model/audience'
import {AudienceService} from '../../../src/lib/audienceService'

chai.use(sinonChai)

describe('AudienceService', () => {
	describe('#updateAudienceType', () => {
		it('should reset all audience fields if type changed to PRIVATE_COURSE', () => {
			const audience = new Audience()
			audience.areasOfWork = ['area-of-work']
			audience.departments = ['department']
			audience.grades = ['grade']
			audience.interests = ['interest']
			audience.requiredBy = new Date()
			audience.frequency = 'frequency'

			AudienceService.updateAudienceType(audience, Audience.Type.PRIVATE_COURSE)

			expect(audience.areasOfWork).to.be.deep.equal([])
			expect(audience.departments).to.be.deep.equal([])
			expect(audience.grades).to.be.deep.equal([])
			expect(audience.interests).to.be.deep.equal([])
			expect(audience.requiredBy).to.be.undefined
			expect(audience.frequency).to.be.undefined
		})

		it('should reset event id audience field if type changed from PRIVATE_COURSE', () => {
			const audience = new Audience()
			audience.type = Audience.Type.PRIVATE_COURSE
			audience.eventId = 'event-id'

			AudienceService.updateAudienceType(audience, Audience.Type.OPEN)

			expect(audience.eventId).to.be.undefined
		})

		it('should reset required by audience field if type changed from REQUIRED_LEARNING to OPEN or CLOSED_COURSE', () => {
			const audience = new Audience()
			audience.type = Audience.Type.REQUIRED_LEARNING
			audience.requiredBy = new Date()

			AudienceService.updateAudienceType(audience, Audience.Type.OPEN)

			expect(audience.requiredBy).to.be.undefined
		})
	})
})
