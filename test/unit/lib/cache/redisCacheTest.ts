import {describe, it, beforeEach} from 'mocha'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {Cache} from '../../../../src/lib/cache/redisCache'
import {RedisClient} from 'redis'

chai.use(sinonChai)

class TestObject {
	id: string
	name: string
}

describe('Redis Cache tests', () => {
	let redisClient: sinon.SinonStubbedInstance<RedisClient>
	let cache: Cache<TestObject>

	beforeEach(() => {
		redisClient = sinon.createStubInstance(RedisClient)
		cache = new Cache<TestObject>(redisClient as any, 3600, 'test-keyspace', TestObject)
	})

	describe('deleteMultiple', () => {
		it('should not call unlink if ids array is empty', async () => {
			redisClient.unlink = sinon.stub()

			await cache.deleteMultiple([])

			expect(redisClient.unlink).to.not.have.been.called
		})

		it('should call unlink if ids array has elements', async () => {
			(redisClient as any).unlink = sinon.stub().yields(null, 2)

			await cache.deleteMultiple(['id1', 'id2'])

			expect((redisClient as any).unlink).to.have.been.calledOnceWith(['id1', 'id2'])
		})
	})

	describe('deleteAllIds', () => {
		it('should fetch all ids and delete them when ids are present', async () => {
			sinon.stub(cache, 'getAllIds').resolves(['id1', 'id2'])
			const deleteMultipleStub = sinon.stub(cache, 'deleteMultiple').resolves()

			await cache.deleteAllIds()

			expect(deleteMultipleStub).to.have.been.calledOnceWith(['id1', 'id2'])
		})

		it('should fetch all ids and pass empty array to deleteMultiple when no ids found', async () => {
			sinon.stub(cache, 'getAllIds').resolves([])
			const deleteMultipleStub = sinon.stub(cache, 'deleteMultiple').resolves()

			await cache.deleteAllIds()

			expect(deleteMultipleStub).to.have.been.calledOnceWith([])
		})
	})
})
