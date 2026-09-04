import {expect} from 'chai'
import {PaginationService, SearchResponse} from '../../../src/lib/paginationService'
import {SearchQuery} from '../../../src/controllers/models/searchQuery'

describe('Pagination tests', function() {
    let pagination: PaginationService = new PaginationService()

    let q: SearchQuery
    let result: SearchResponse<any>

    beforeEach(() => {
        q = new SearchQuery()
        result = {
            results: [],
            page: 1,
            size: 10,
            totalResults: 50
        }
    })

    describe('getPagination', function() {
        it('should return 1 as previous if currentPage is 2', function() {
            result.page = 1
            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.previous!.href).to.equal('/content-management/search?p=1')
        })

        it('should return null as previous if currentPage is 1', function() {
            result.page = 0
            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.previous).to.equal(undefined)
        })

        it('should return 3 as next if currentPage is 2', function() {
            result.page = 1
            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.next!.href).to.equal('/content-management/search?p=3')
        })

        it('should return null as next if currentPage is the last page', function() {
            result.page = 4
            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.next).to.equal(undefined)
        })

        it('should return only the first page as current when currentPage is 1 and total pages is 1', function() {
            result.page = 0
            result.totalResults = 10
            const paginationItems = [{ number: 1, url: '/content-management/search?p=1', current: true }]

            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.items).to.deep.equal(paginationItems)
        })

        it('should return 1,[2],3,...,10 as items if currentPage is 2 and total pages is 10', function() {
            result.page = 1
            result.totalResults = 100
            const paginationItems = [
                { number: 1, url: '/content-management/search?p=1' },
                { number: 2, url: '/content-management/search?p=2', current: true },
                { number: 3, url: '/content-management/search?p=3' },
                { ellipsis: true },
                { number: 10, url: '/content-management/search?p=10' }
            ]

            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.items).to.deep.equal(paginationItems)
        })

        it('should return 1,...,8,[9],10 as items if currentPage is 9 and total pages is 10', function() {
            result.page = 8
            result.totalResults = 100
            const paginationItems = [
                { number: 1, url: '/content-management/search?p=1' },
                { ellipsis: true },
                { number: 8, url: '/content-management/search?p=8' },
                { number: 9, url: '/content-management/search?p=9', current: true },
                { number: 10, url: '/content-management/search?p=10' }
            ]

            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.items).to.deep.equal(paginationItems)
        })

        it('should return 1,...,9,[10] as items if currentPage is 10 and total pages is 10', function() {
            result.page = 9
            result.totalResults = 100
            const paginationItems = [
                { number: 1, url: '/content-management/search?p=1' },
                { ellipsis: true },
                { number: 9, url: '/content-management/search?p=9'},
                { number: 10, url: '/content-management/search?p=10', current: true  }
            ]

            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.pagination.items).to.deep.equal(paginationItems)
        })
    })

})