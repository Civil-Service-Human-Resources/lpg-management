import { plainToClass, plainToInstance } from 'class-transformer';

import { Cache } from '../lib/redisCache';
import { OrganisationalUnit } from './model/organisationalUnit';
import { OrganisationalUnitTypeAhead } from './model/organisationalUnitTypeAhead';
import { promisify } from 'util'

export class OrganisationalUnitCache extends Cache<OrganisationalUnit> {

    getBaseKey(): string {
        return "organisationalUnits"
    }

	protected convert(cacheHit: string): OrganisationalUnit {
		return plainToClass(OrganisationalUnit, cacheHit)
	}

    private getTypeaheadKey() {
        return `${this.getBaseKey()}:typeahead`
    }

    async setTypeaheadList(typeahead: OrganisationalUnitTypeAhead, ttlOverride?: number) {
        await promisify(this.redisClient.setex).bind(this.redisClient)
                        (this.getTypeaheadKey(),
                        ttlOverride ? ttlOverride : this.defaultTTL,
                        JSON.stringify(typeahead))
    }

    async getTypeaheadList(): Promise<OrganisationalUnitTypeAhead | undefined> {
        const key = this.getTypeaheadKey()
        const existingTypeAhead = await promisify(this.redisClient.get).bind(this.redisClient)(key)
        if (existingTypeAhead === null) {
            return undefined
        }
        return plainToInstance(OrganisationalUnitTypeAhead, JSON.parse(existingTypeAhead) as OrganisationalUnitTypeAhead)
    }

    async getOrgHierarchy (
        organisationId: number,
        hierarchy: OrganisationalUnit[] = []
    ): Promise<OrganisationalUnit[] | undefined> {
        const currentOrg = await this.get(organisationId)
        if (currentOrg !== undefined) {
            hierarchy.push(currentOrg)
            if (currentOrg.parentId && currentOrg.parentId !== 0) {
                return await this.getOrgHierarchy(currentOrg.parentId, hierarchy)
            }
            return hierarchy
        } else {
            return undefined
        }
    }
}
