import {AgencyToken} from './agencyToken'

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

	formatNameWithAbbrev() {
		return (this.abbreviation && this.abbreviation !== '') ? `${this.name} (${this.abbreviation})` : this.name
	}

}
