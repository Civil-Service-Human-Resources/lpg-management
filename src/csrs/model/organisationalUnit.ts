import {AgencyToken} from './agencyToken'
import { OrganisationalUnitPageModel } from './organisationalUnitPageModel'

export class OrganisationalUnit {
	id: number

	name: string

	code: string

	abbreviation?: string

	paymentMethods: string[]

	parentId?: number | null

	children: OrganisationalUnit[] = []

	formattedName: string

	parent?: OrganisationalUnit

	uri: string

	agencyToken?: AgencyToken

	getHierarchyAsArray() {
		let hierarchy: OrganisationalUnit[] = [this]
		let currentParent = this.parent
		while (currentParent) {
			hierarchy.push(currentParent)
			currentParent = currentParent.parent
		}
		return hierarchy
	}

	updateWithPageModel(pageModel: OrganisationalUnitPageModel) {
		this.abbreviation = pageModel.abbreviation
		this.code = pageModel.code
		this.name = pageModel.name
		this.parentId = pageModel.parentId
	}
}
