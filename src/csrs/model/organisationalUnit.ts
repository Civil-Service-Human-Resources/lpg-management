import {AgencyToken} from './agencyToken'
import { OrganisationalUnitPageModel } from './organisationalUnitPageModel'
import {Domain} from './domain'
import {CacheableObject} from 'lib/cacheableObject'
import {Type} from 'class-transformer'

export class OrganisationalUnit implements CacheableObject {
    getId(): string {
        return this.id.toString()
    }

	id: number

	name: string

	code: string

	abbreviation?: string

	paymentMethods: string[]

	parentId?: number | null

	children: OrganisationalUnit[] = []

	formattedName?: string

	@Type(() => OrganisationalUnit)
	parent?: OrganisationalUnit

	uri: string

	@Type(() => AgencyToken)
	agencyToken?: AgencyToken

	@Type(() => Domain)
	domains: Domain[] = []

	getFormattedName() {
		const names = [this.name]
		let currentParent = this.parent
		while (currentParent) {
			names.unshift(currentParent.name)
			currentParent = currentParent.parent
		}
		return names.join(" | ")
	}

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

	sortDomainsByName() {
		this.domains.sort((a, b) => {
			return (a.domain < b.domain) ? -1 : 1
		})
	}

	insertAndSortDomain(domain: Domain) {
		if (!this.doesDomainExist(domain.domain)) {
			this.domains.push(domain)
			this.sortDomainsByName()
		}
	}

	doesDomainExist(domain: string) {
		return this.domains.find(d => d.domain === domain) !== undefined
	}

	removeDomain(domainId: number) {
		this.domains = this.domains.filter(d => d.id !== domainId )
	}

	isTierOneOrganisation(){
		return this.parentId === null
	}

	getTopTierOrganisation(organisations: OrganisationalUnit[]){
		let parentId: number | null | undefined = this.id
		let organisation

		while(parentId !== null){
			organisation = organisations.find((org) => org.id === parentId)
			parentId = organisation && organisation.parentId
		}

		return organisation
	}
}
