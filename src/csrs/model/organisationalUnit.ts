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

	formattedName?: string

	parent?: OrganisationalUnit

	uri: string

	agencyToken?: AgencyToken

	updateWithPageModel(pageModel: OrganisationalUnitPageModel) {
		this.abbreviation = pageModel.abbreviation
		this.code = pageModel.code
		this.name = pageModel.name
		this.parentId = pageModel.parentId || null
		if (!this.parentId) {
			this.parent = undefined
		}
	}

	getHierarchyAsArray() {
		const hierarchy: OrganisationalUnit[] = [this]
		let currentParent = this.parent
		while (currentParent) {
			hierarchy.push(currentParent)
			currentParent = currentParent.parent
		}
		return hierarchy
	}

	getOrgAndChildren() {
		const hierarchy: OrganisationalUnit[] = [this]
		for (const org of this.children) {
			hierarchy.push(...org.getOrgAndChildren())
		}
		return hierarchy
	}

	formatNameWithAbbrev() {
		return (this.abbreviation && this.abbreviation !== '') ? `${this.name} (${this.abbreviation})` : this.name
	}

}
