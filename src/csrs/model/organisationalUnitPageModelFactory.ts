import { toInteger } from "lodash"
import { OrganisationalUnitPageModel } from "./organisationalUnitPageModel"

export class OrganisationalUnitPageModelFactory {
	constructor() {
		this.create = this.create.bind(this)
	}
    public create(data: any): OrganisationalUnitPageModel {
		const organisationalUnit: OrganisationalUnitPageModel = new OrganisationalUnitPageModel()
		organisationalUnit.name = data.name.replaceAll("&amp;", "&").trim()
		organisationalUnit.code = data.code
		organisationalUnit.parentId = toInteger(data.parentId)
		organisationalUnit.abbreviation = data.abbreviation

		return organisationalUnit
	}
}