import {expect} from 'chai'
import {describe, it} from 'mocha'
import {OrganisationalUnitFactory} from '../../../../src/csrs/model/organisationalUnitFactory'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'
import {AgencyToken} from '../../../../src/csrs/model/agencyToken'
import {AgencyDomain} from '../../../../src/csrs/model/agencyDomain'

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
		const children = [childOrganisationalUnit]
		const agency: AgencyToken = new AgencyToken()
		agency.uid = '123'
		agency.capacity = 200
		agency.token = 'token978'
		let ad1: AgencyDomain = new AgencyDomain()
		ad1.domain = 'domain1'
		let ad2: AgencyDomain = new AgencyDomain()
		ad2.domain = 'domain2'
		let agencyDomains: AgencyDomain[] = [ad1, ad2]
		agency.agencyDomains = agencyDomains
		agency.capacityUsed = 9

		const data: object = {
			id: id,
			name: name,
			code: code,
			paymentMethods: paymentMethods,
			children: children,
			agencyToken: agency,
		}

		const result: OrganisationalUnit = organisationalUnitFactory.create(data)

		expect(result.id).to.eql(id)
		expect(result.name).to.eql(name)
		expect(result.code).to.eql(code)
		expect(result.paymentMethods).to.eql(paymentMethods)
		expect(result.children[0].name).to.eql(children[0].name)
		expect(result.agencyToken.token).to.eql(agency.token)
		expect(result.agencyToken.capacity).to.eql(agency.capacity)
		expect(result.agencyToken.capacityUsed).to.eql(agency.capacityUsed)
		expect(result.agencyToken.agencyDomains.length).to.eql(agency.agencyDomains.length)
		expect(result.agencyToken.agencyDomains[0].domain).to.eql(agency.agencyDomains[0].domain)
		expect(result.agencyToken.agencyDomains[1].domain).to.eql(agency.agencyDomains[1].domain)
	})
})
