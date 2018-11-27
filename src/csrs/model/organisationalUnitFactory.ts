import {OrganisationalUnit} from './organisationalUnit'

export class OrganisationalUnitFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	public create(data: any): any {
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()

		organisationalUnit.id = data.id
		organisationalUnit.name = data.name
		organisationalUnit.code = data.code
		organisationalUnit.paymentMethods = data.paymentMethods
		organisationalUnit.subOrgs = (data.subOrgs || []).map(this.create)
		organisationalUnit.parent = data.parent
		organisationalUnit.abbreviation = data.abbreviation

		return organisationalUnit
	}
}
