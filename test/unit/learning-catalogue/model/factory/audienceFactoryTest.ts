import {Audience} from '../../../../../src/learning-catalogue/model/audience'
import {AudienceFactory} from '../../../../../src/learning-catalogue/model/factory/audienceFactory'
import {expect} from 'chai'
import {describe, it} from 'mocha'

describe('AudienceFactory tests', () => {
	const audienceFactory: AudienceFactory = new AudienceFactory()

	it('Should create Audience from data', () => {
		const areasOfWork: string[] = ['digital', 'project-delivery']
		const departments: string[] = ['dh', 'co']
		const grades: string[] = ['AA', 'G7', 'SCS']
		const interests: string[] = ['basket weaving', 'fly fishing']
		const requiredBy = '2001-03-31T00:00:00'
		const mandatory = true
		const frequency = 'YEARLY'

		const data: object = {
			areasOfWork: areasOfWork,
			departments: departments,
			grades: grades,
			interests: interests,
			requiredBy: requiredBy,
			mandatory: mandatory,
			frequency: frequency,
		}

		const result: Audience = audienceFactory.create(data)

		expect(result.areasOfWork).to.eql(areasOfWork)
		expect(result.departments).to.eql(departments)
		expect(result.grades).to.eql(grades)
		expect(result.interests).to.eql(interests)
		expect(result.requiredBy!.toISOString().substr(0, 19)).to.equal(requiredBy)
		expect(result.mandatory).to.equal(mandatory)
		expect(result.frequency).to.equal(frequency)
	})

	it('Should ignore requiredBy if missing', () => {
		const areasOfWork: string[] = ['digital', 'project-delivery']
		const departments: string[] = ['dh', 'co']
		const grades: string[] = ['AA', 'G7', 'SCS']
		const interests: string[] = ['basket weaving', 'fly fishing']
		const mandatory = true
		const frequency = 'YEARLY'

		const data: object = {
			areasOfWork: areasOfWork,
			departments: departments,
			grades: grades,
			interests: interests,
			mandatory: mandatory,
			frequency: frequency,
		}

		const result: Audience = audienceFactory.create(data)

		expect(result.areasOfWork).to.eql(areasOfWork)
		expect(result.departments).to.eql(departments)
		expect(result.grades).to.eql(grades)
		expect(result.interests).to.eql(interests)
		expect(result.requiredBy).to.be.undefined
		expect(result.mandatory).to.equal(mandatory)
		expect(result.frequency).to.equal(frequency)
	})
})
