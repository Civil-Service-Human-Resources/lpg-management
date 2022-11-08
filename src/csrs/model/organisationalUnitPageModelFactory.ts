import { toInteger } from "lodash"
import { Factory } from "../../learning-catalogue/model/factory/factory"
import { OrganisationalUnitPageModel } from "./organisationalUnitPageModel"

export class OrganisationalUnitPageModelFactory extends Factory<OrganisationalUnitPageModel> {
    public create(data: any): OrganisationalUnitPageModel {
		const organisationalUnit: OrganisationalUnitPageModel = new OrganisationalUnitPageModel()
		console.log(data)
		organisationalUnit.name = data.name
		console.log(data.name)
		organisationalUnit.code = data.code
		console.log(data.code)
		organisationalUnit.parentId = toInteger(data.parentId)
		console.log(data.parentId)
		organisationalUnit.abbreviation = data.abbreviation
		console.log(data.abbreviation)

		return organisationalUnit
	}
}