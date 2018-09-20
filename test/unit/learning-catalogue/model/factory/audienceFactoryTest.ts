import {expect} from 'chai'
import {describe, it} from 'mocha'
import {AudienceFactory} from '../../../../../src/learning-catalogue/model/factory/audienceFactory'
import {Audience} from '../../../../../src/learning-catalogue/model/audience'

describe('AudienceFactory tests', () => {
	const audienceFactory: AudienceFactory = new AudienceFactory()

	it('Should create Audience from data', () => {
		const areasOfWork: string[] = ['digital', 'project-delivery']
		const departments: string[] = ['dh', 'co']
		const grades: string[] = ['AA', 'G7', 'SCS']
		const interests: string[] = ['basket weaving', 'fly fishing']
		const requiredBy = '2001-03-31T00:00:00'
		const type = 'OPEN'
		const frequency = 'YEARLY'

		const data: object = {
			areasOfWork: areasOfWork,
			departments: departments,
			grades: grades,
			interests: interests,
			requiredBy: requiredBy,
			type: type,
			frequency: frequency,
		}

		const result: Audience = audienceFactory.create(data)

		expect(result.areasOfWork).to.eql(areasOfWork)
		expect(result.departments).to.eql(departments)
		expect(result.grades).to.eql(grades)
		expect(result.interests).to.eql(interests)
		expect(result.requiredBy!.toISOString().substr(0, 19)).to.equal(requiredBy)
		expect(result.type).to.equal(Audience.Type.OPEN)
		expect(result.frequency).to.equal(frequency)
	})

	it('Should ignore requiredBy if missing', () => {
		const areasOfWork: string[] = ['digital', 'project-delivery']
		const departments: string[] = ['dh', 'co']
		const grades: string[] = ['AA', 'G7', 'SCS']
		const interests: string[] = ['basket weaving', 'fly fishing']
		const type = 'OPEN'
		const frequency = 'YEARLY'

		const data: object = {
			areasOfWork: areasOfWork,
			departments: departments,
			grades: grades,
			interests: interests,
			type: type,
			frequency: frequency,
		}

		const result: Audience = audienceFactory.create(data)

		expect(result.areasOfWork).to.eql(areasOfWork)
		expect(result.departments).to.eql(departments)
		expect(result.grades).to.eql(grades)
		expect(result.interests).to.eql(interests)
		expect(result.requiredBy).to.be.undefined
		expect(result.type).to.equal(Audience.Type.OPEN)
		expect(result.frequency).to.equal(frequency)
	})
})
