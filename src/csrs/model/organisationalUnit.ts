import { toInteger } from 'lodash'
import {AgencyToken} from './agencyToken'
import { OrganisationalUnitPageModel } from './organisationalUnitPageModel'

export class OrganisationalUnit {
	id: number

	name: string

	code: string

	abbreviation?: string

	paymentMethods: string[]

	parentId: number | null

	children: OrganisationalUnit[]

	formattedName?: string

	parent?: OrganisationalUnit

	uri: string

	agencyToken?: AgencyToken

	getFormattedName() {
		let abbrev = (this.abbreviation === undefined ||
			this.abbreviation.length === 0) ? "" :
			`(${this.abbreviation})`
		return `${name} + ${abbrev}`
	}

	updateWithPageModel(pageModel: OrganisationalUnitPageModel) {
		this.abbreviation = pageModel.abbreviation
		this.code = pageModel.code
		this.name = pageModel.name
		this.parentId = toInteger(pageModel.parent)
	}
}
