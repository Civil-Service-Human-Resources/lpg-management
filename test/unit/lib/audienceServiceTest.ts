import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {beforeEach, describe} from 'mocha'
import {expect} from 'chai'
import {Audience} from '../../../src/learning-catalogue/model/audience'
import {AudienceService} from '../../../src/lib/audienceService'
import {CsrsService} from '../../../src/csrs/service/csrsService'

chai.use(sinonChai)

describe('AudienceService', () => {
	let csrsService: CsrsService = <CsrsService>{}
	let audienceService: AudienceService = new AudienceService(csrsService)

	describe('#getAudienceName', () => {
		let audience: Audience = new Audience()
		const departments = ['hmrc-5', 'co-123']
		const areasOfWork = ['Finance', 'Commercial']
		const interests = ['Parliament and the constitution', 'EU and international', 'Leadership']

		
		const departmentsString: string = 'CO, HMRC'
		const areasOfWorkString: string = 'Commercial, Finance'
		const interestsString: string = 'EU and international, Leadership, Parliament and the constitution'
		
		beforeEach(() => {
			const departmentAbbrevs = ['CO', 'HMRC']
			csrsService.getDepartmentAbbreviationsFromCodes = sinon.stub().withArgs(departments).resolves(departmentAbbrevs)
			audience.departments = departments
			audience.areasOfWork = areasOfWork
			audience.interests = interests
		})

		it('should generate the expected audience name based on its organisations, areas of work, and interests', async function() {
			audience.name = await audienceService.getAudienceName(audience)

			expect(audience.name).to.be.equal(`${departmentsString}, ${areasOfWorkString}, ${interestsString}`)
		})

		it('should generate the expected audience name based on its areas of work and interests', async function() {
			audience.departments = []
			audience.name = await audienceService.getAudienceName(audience)

			expect(audience.name).to.be.equal(`${areasOfWorkString}, ${interestsString}`)
		})

		it('should generate the expected audience name based on its organisations and interests', async function() {
			audience.areasOfWork = []
			audience.name = await audienceService.getAudienceName(audience)

			expect(audience.name).to.be.equal(`${departmentsString}, ${interestsString}`)
		})

		it('should generate the expected audience name based on its organisations and areas of work', async function() {
			audience.interests = []
			audience.name = await audienceService.getAudienceName(audience)

			expect(audience.name).to.be.equal(`${departmentsString}, ${areasOfWorkString}`)
		})

		it('should generate the expected audience name based on its organisations', async function() {
			audience.areasOfWork = []
			audience.interests = []
			audience.name = await audienceService.getAudienceName(audience)

			expect(audience.name).to.be.equal(`${departmentsString}`)
		})

		it('should generate the expected audience name based on its areas of work', async function() {
			audience.departments = []
			audience.interests = []
			audience.name = await audienceService.getAudienceName(audience)

			expect(audience.name).to.be.equal(`${areasOfWorkString}`)
		})

		it('should generate the expected audience name based on its interests', async function() {
			audience.departments = []
			audience.areasOfWork = []
			audience.name = await audienceService.getAudienceName(audience)

			expect(audience.name).to.be.equal(`${interestsString}`)
		})

		it('should generate a temporary name when there are no organisations, areas of work, or interests', async function() {
			audience.departments = []
			audience.areasOfWork = []
			audience.interests = []
			audience.name = await audienceService.getAudienceName(audience)
			expect(audience.name).to.eql('')
		})
	})
})
