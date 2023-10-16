import { plainToClass } from 'class-transformer';

import { Cache } from '../lib/redisCache';
import { OrganisationalUnit } from './model/organisationalUnit';

export class OrganisationalUnitCache extends Cache<OrganisationalUnit> {

    getBaseKey(): string {
        return "organisationalUnits"
    }

    async set(id: string | number, organisationalUnit: OrganisationalUnit, ttlOverride?: number) {
        organisationalUnit.parent = undefined
        organisationalUnit.children = []
        super.set(id, organisationalUnit, ttlOverride)
    }

	setMultiple(organisationalUnits: OrganisationalUnit[], ttlOverride?: number) {
		return organisationalUnits.map(o => this.set(o.id, o, ttlOverride))
	}

	protected convert(cacheHit: string): OrganisationalUnit {
		return plainToClass(OrganisationalUnit, cacheHit)
	}
}
