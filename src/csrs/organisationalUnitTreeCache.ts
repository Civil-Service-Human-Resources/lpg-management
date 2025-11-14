import { Cache } from '../lib/cache/redisCache';
import {OrganisationalUnitTree} from '../csl-service/model/organisationalUnit/organisationalUnitTree'
import {FetchedRedisCache} from '../lib/cache/fetchedRedisCache'
import {OrganisationalUnitClient} from './client/organisationalUnitClient'

export class OrganisationalUnitTreeCache extends FetchedRedisCache<OrganisationalUnitTree> {

    constructor(cache: Cache<OrganisationalUnitTree>, private organisationalUnitClient: OrganisationalUnitClient) {
        super(cache, "organisationalUnitTree")
    }

    async fetchResource(): Promise<OrganisationalUnitTree> {
        return await this.organisationalUnitClient.getTree()
    }
}
