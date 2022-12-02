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
		this.parentId = pageModel.parentId
		if (!this.parentId) {
			this.parent = undefined
		}
	}

	getHierarchyAsArray() {
		let hierarchy: OrganisationalUnit[] = []
		let currentOrg: OrganisationalUnit | undefined = this
		while (currentOrg) {
			const parent: OrganisationalUnit | undefined = currentOrg.parent
			currentOrg.parent = undefined
			hierarchy.push(currentOrg)
			currentOrg = parent
		}
		return hierarchy
	}

	formatNameWithAbbrev() {
		return (this.abbreviation && this.abbreviation !== '') ? `${this.name} (${this.abbreviation})` : this.name
	}

}
