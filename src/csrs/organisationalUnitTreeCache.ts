import {Cache} from '../lib/cache/redisCache'
import {TaxonomyTree} from 'lib/taxonomy/taxonomyTree'
import {FetchedRedisCache} from '../lib/cache/fetchedRedisCache'
import {OrganisationalUnitClient} from './client/organisationalUnitClient'

export class OrganisationalUnitTreeCache extends FetchedRedisCache<TaxonomyTree> {

    constructor(cache: Cache<TaxonomyTree>, private organisationalUnitClient: OrganisationalUnitClient) {
        super(cache, "organisationalUnitTree")
    }

    async fetchResource(): Promise<TaxonomyTree> {
        return await this.organisationalUnitClient.getTree()
    }
}
