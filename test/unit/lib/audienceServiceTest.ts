import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {beforeEach, describe} from 'mocha'
import {Audience} from '../../../src/learning-catalogue/model/audience'
import {AudienceService} from '../../../src/lib/audienceService'
import {LearningCatalogue} from '../../../src/learning-catalogue'

chai.use(sinonChai)

describe('AudienceService', () => {
	let audienceService: AudienceService
	let learningCatalogue: LearningCatalogue

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		audienceService = new AudienceService(learningCatalogue)
	})

	describe('#updateAudienceType', () => {
		it('should reset all audience fields if type changed to PRIVATE_COURSE', () => {
			const audience = new Audience()
			audience.areasOfWork = ['area-of-work']
			audience.departments = ['department']
			audience.grades = ['grade']
			audience.interests = ['interest']
			audience.requiredBy = new Date()
			audience.frequency = 'frequency'

			audienceService.updateAudienceType(audience, Audience.Type.PRIVATE_COURSE)

			expect(audience.areasOfWork).to.be.deep.equal([])
			expect(audience.departments).to.be.deep.equal([])
			expect(audience.grades).to.be.deep.equal([])
			expect(audience.interests).to.be.deep.equal([])
			expect(audience.requiredBy).to.be.undefined
			expect(audience.frequency).to.be.undefined
		})
	})
})
