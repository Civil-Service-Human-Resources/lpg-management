import {CacheableObjectCache} from '../lib/cache/cacheableObjectCache'
import { FormattedOrganisationList } from "../csl-service/model/organisationalUnit/FormattedOrganisationList"
import {RedisClient} from 'redis'

export class FormattedOrganisationListCache extends CacheableObjectCache<FormattedOrganisationList>{

    constructor(redisClient: RedisClient, defaultTTL: number) {
        super(redisClient, defaultTTL, "formattedOrganisationList", FormattedOrganisationList)
    }
}
