import { expect } from 'chai'
import { RedisClient } from 'redis'
import sinon = require('sinon')
import { OrganisationalUnitCache } from '../../../src/csrs/organisationalUnitCache'

describe('RedisCache tests', () => {

    const client = sinon.createStubInstance(RedisClient)
    let cache: OrganisationalUnitCache
    
    beforeEach(() => {
        cache = new OrganisationalUnitCache(client as any, 100)
    })
    
    describe('get function', () => {
        it('Should get an object with a key', async () => {
            const getFunc = (args: string[]) => {return '{"id": 1, "name": "A", "formattedName":"A"}'}
            client.get.bind(getFunc)
            const org = await cache.get(1)
            expect(org!.name).to.eql("A")
            expect(org!.id).to.eql(1)
            expect(org!.formattedName).to.eql("A")
        })
    })
})