import {AgencyToken} from './agencyToken'
import {Domain} from './domain'
import {Type} from 'class-transformer'
import {CachedTaxonomyItem} from '../../lib/taxonomy/cachedTaxonomyItem'

export class OrganisationalUnit implements CachedTaxonomyItem {
    getId(): string {
        return this.id.toString()
    }

	id: number
	name: string
	code: string
	abbreviation?: string
	parentId?: number
	parentName?: string

	@Type(() => AgencyToken)
	agencyToken?: AgencyToken

	@Type(() => Domain)
	domains: Domain[] = []

	doesDomainExist(domain: string) {
		return this.domains.find(d => d.domain === domain) !== undefined
	}

	clearParent() {
		this.parentId = undefined
		this.parentName = undefined
	}
}
