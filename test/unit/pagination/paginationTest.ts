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
            expect(paginationResult.prevLink).to.equal('/content-management/search?p=1')
        })

        it('should return null as previous if currentPage is 1', function() {
            result.page = 0
            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.prevLink).to.equal(undefined)
        })

        it('should return 3 as next if currentPage is 2', function() {
            result.page = 1
            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.nextLink).to.equal('/content-management/search?p=3')
        })

        it('should return null as next if currentPage is the last page', function() {
            result.page = 4
            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.nextLink).to.equal(undefined)
        })

        it('should return 1,[2],3,...,10 as items if currentPage is 2 and total pages is 10', function() {
            result.page = 1
            result.totalResults = 100
            const paginationItems = [
                { number: 1, href: '/content-management/search?p=1', current: false },
                { number: 2, href: undefined, current: true },
                { number: 3, href: '/content-management/search?p=3', current: false },
                { ellipsis: true },
                { number: 10, href: '/content-management/search?p=10', current: false }
            ]

            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.numberedPages).to.deep.equal(paginationItems)
        })

        it('should return 1,...,8,[9],10 as items if currentPage is 9 and total pages is 10', function() {
            result.page = 8
            result.totalResults = 100
            const paginationItems = [
                { number: 1, href: '/content-management/search?p=1', current: false  },
                { ellipsis: true },
                { number: 8, href: '/content-management/search?p=8', current: false  },
                { number: 9, href: undefined, current: true },
                { number: 10, href: '/content-management/search?p=10', current: false  }
            ]

            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.numberedPages).to.deep.equal(paginationItems)
        })

        it('should return 1,...,9,[10] as items if currentPage is 10 and total pages is 10', function() {
            result.page = 9
            result.totalResults = 100
            const paginationItems = [
                { number: 1, href: '/content-management/search?p=1', current: false  },
                { ellipsis: true },
                { number: 9, href: '/content-management/search?p=9', current: false },
                { number: 10, href: undefined, current: true  }
            ]

            const paginationResult = pagination.getPagination(q, result)
            expect(paginationResult.numberedPages).to.deep.equal(paginationItems)
        })
    })

})