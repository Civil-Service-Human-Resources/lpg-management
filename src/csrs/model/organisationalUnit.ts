import {AgencyToken} from './agencyToken'
import {Domain} from './domain'
import {CacheableObject} from 'lib/cache/cacheableObject'
import {Type} from 'class-transformer'

export class OrganisationalUnit implements CacheableObject {
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
