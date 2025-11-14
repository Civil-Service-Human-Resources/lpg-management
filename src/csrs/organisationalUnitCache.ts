import { OrganisationalUnit } from './model/organisationalUnit';
import {RedisClient} from 'redis'
import {CacheableObjectCache} from '../lib/cache/cacheableObjectCache'

export class OrganisationalUnitCache extends CacheableObjectCache<OrganisationalUnit> {

    constructor(redisClient: RedisClient, defaultTTL: number) {
		super(redisClient, defaultTTL, "organisationalUnits", OrganisationalUnit)
	}
}
