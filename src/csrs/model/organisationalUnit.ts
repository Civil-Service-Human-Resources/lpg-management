import {AgencyToken} from './agencyToken'
import { OrganisationalUnitPageModel } from './organisationalUnitPageModel'
import {Domain} from './domain'
import {CacheableObject} from 'lib/cacheableObject'

export class OrganisationalUnit implements CacheableObject {
    getId(): string {
        throw this.id.toString()
    }

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

	domains: Domain[] = []

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

	insertAndSortDomain(domain: Domain) {
		if (this.domains.find(d => d.domain === domain.domain) === undefined) {
			this.domains.push(domain)
			this.domains.sort((a, b) => {
				return (a.domain < b.domain) ? -1 : 1
			})
		}
	}

	doesDomainExist(domain: string) {
		return Array.from(this.domains).find(d => d.domain === domain) !== undefined
	}

}
