import { toInteger } from "lodash"
import { Factory } from "../../learning-catalogue/model/factory/factory"
import { OrganisationalUnitPageModel } from "./organisationalUnitPageModel"

export class OrganisationalUnitPageModelFactory extends Factory<OrganisationalUnitPageModel> {
    public create(data: any): OrganisationalUnitPageModel {
		const organisationalUnit: OrganisationalUnitPageModel = new OrganisationalUnitPageModel()
		organisationalUnit.name = data.name.replaceAll("&amp;", "&")
		organisationalUnit.code = data.code
		organisationalUnit.parentId = toInteger(data.parentId)
		organisationalUnit.abbreviation = data.abbreviation

		return organisationalUnit
	}
}