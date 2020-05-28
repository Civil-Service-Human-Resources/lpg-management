import {expect} from 'chai'
import {AgencyTokenCapacityUsedFactory} from '../../../../src/identity/model/AgencyTokenCapacityUsedFactory'
import {AgencyTokenCapacityUsed} from '../../../../src/identity/model/AgencyTokenCapacityUsed'

describe('AgencyTokenCapacityUsedFactory tests', () => {
	const agencyTokenCapacityUsedFactory: AgencyTokenCapacityUsedFactory = new AgencyTokenCapacityUsedFactory()

	it('should set capacity used field', () => {
		const data: object = {capacityUsed: '30'}

		const result: AgencyTokenCapacityUsed = agencyTokenCapacityUsedFactory.create(data)

		expect(result.capacityUsed).to.equal('30')
	})
})
