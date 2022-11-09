import { plainToClass } from 'class-transformer';

import { Cache } from '../lib/redisCache';
import { OrganisationalUnit } from './model/organisationalUnit';

export class OrganisationalUnitCache extends Cache<OrganisationalUnit> {

    getBaseKey(): string {
        return "organisationalUnits"
    }

	protected convert(cacheHit: string): OrganisationalUnit {
		return plainToClass(OrganisationalUnit, cacheHit)
	}
}
