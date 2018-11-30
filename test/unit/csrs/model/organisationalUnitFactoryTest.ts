import {expect} from 'chai'
import {describe, it} from 'mocha'
import {OrganisationalUnitFactory} from '../../../../src/csrs/model/organisationalUnitFactory'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'

describe('OrganisationalUnitFactory tests', () => {
	const organisationalUnitFactory: OrganisationalUnitFactory = new OrganisationalUnitFactory()

	it('Should create OrganisationalUnit from data', () => {
		const childOrganisationalUnit = new OrganisationalUnit()
		childOrganisationalUnit.id = 'child-id'
		childOrganisationalUnit.name = 'child-name'

		const id = 'audience-id'
		const name = 'organisational-unit'
		const code = '123'
		const paymentMethods = ['PO123']
		const subOrgs = [childOrganisationalUnit]

		const data: object = {
			id: id,
			name: name,
			code: code,
			paymentMethods: paymentMethods,
			subOrgs: subOrgs,
		}

		const result: OrganisationalUnit = organisationalUnitFactory.create(data)

		expect(result.id).to.eql(id)
		expect(result.name).to.eql(name)
		expect(result.code).to.eql(code)
		expect(result.paymentMethods).to.eql(paymentMethods)
		expect(result.subOrgs[0].name).to.eql(subOrgs[0].name)
	})
})
