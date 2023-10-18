import { plainToClass } from 'class-transformer';

import { OrganisationalUnit } from './model/organisationalUnit';
import {CacheableObjectCache} from 'lib/cacheableObjectCache'

export class OrganisationalUnitCache extends CacheableObjectCache<OrganisationalUnit> {

    getBaseKey(): string {
        return "organisationalUnits"
    }

    async set(id: string | number, organisationalUnit: OrganisationalUnit, ttlOverride?: number) {
        organisationalUnit.parent = undefined
        organisationalUnit.children = []
        super.set(id, organisationalUnit, ttlOverride)
    }

	protected convert(cacheHit: string): OrganisationalUnit {
		return plainToClass(OrganisationalUnit, cacheHit)
	}
}
