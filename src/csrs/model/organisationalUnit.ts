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

	getNameAndAbbrev() {
		let abbrev = (this.abbreviation === undefined) ? "" :
			` (${this.abbreviation})`
		return `${this.name}${abbrev}`
	}

	updateWithPageModel(pageModel: OrganisationalUnitPageModel) {
		this.abbreviation = pageModel.abbreviation
		this.code = pageModel.code
		this.name = pageModel.name
		this.parentId = pageModel.parentId
	}
}
