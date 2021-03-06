import {OrganisationalUnit} from './organisationalUnit'
import * as config from '../../config/index'

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
		organisationalUnit.children = (data.children || []).map(this.create)
		organisationalUnit.parent = data.parent
		organisationalUnit.abbreviation = data.abbreviation
		organisationalUnit.agencyToken = data.agencyToken
		organisationalUnit.uri = `${config.REGISTRY_SERVICE.url}/organisationalUnits/${organisationalUnit.id}`

		return organisationalUnit
	}
}
