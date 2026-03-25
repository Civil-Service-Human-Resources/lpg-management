import { expect } from "chai"
import { Pagination } from "../../../src/lib/pagination"

describe('Pagination tests', function() {
    let pagination: Pagination

    beforeEach(() => {
        pagination = new Pagination()
    })

    describe('getPagination', function() {
        it('should return 1 as previous if currentPage is 2', function() {
            const currentPage = 2
            const expectedHref = '/test?page=0'

            const result = pagination.getPagination(currentPage, 10, '/test?page=')

            expect(result.previous).to.deep.equal({ href: expectedHref })
        })

        it('should return null as previous if currentPage is 1', function() {
            const currentPage = 1
            const expectedPrevious = null

            const result = pagination.getPagination(currentPage, 10, '/test?page=')

            expect(result.previous).to.deep.equal(expectedPrevious)
        })

        it('should return 3 as next if currentPage is 2', function() {
            const currentPage = 2
            const expectedHref = '/test?page=2'

            const result = pagination.getPagination(currentPage, 10, '/test?page=')

            expect(result.next).to.deep.equal({ href: expectedHref })
        })

        it('should return null as next if currentPage is the last page', function() {
            const currentPage = 10
            const totalPages = 10
            const expectedNext = null

            const result = pagination.getPagination(currentPage, totalPages, '/test?page=')

            expect(result.next).to.deep.equal(expectedNext) 
        })

        it('should return only the first page as current when currentPage is 1 and total pages is 1', function() {
            const currentPage = 1
            const totalPages = 1
            const paginationItems = [{ number: 1, url: '/test?page=0', current: true }]

            const result = pagination.getPagination(currentPage, totalPages, '/test?page=')

            expect(result.items).to.deep.equal(paginationItems)
        })

        it('should return 1,[2],3,...,10 as items if currentPage is 2 and total pages is 10', function() {
            const currentPage = 2
            const totalPages = 10
            const paginationItems = [
                { number: 1, url: '/test?page=0' },
                { number: 2, url: '/test?page=1', current: true },
                { number: 3, url: '/test?page=2' },
                { ellipsis: true },
                { number: 10, url: '/test?page=9' }
            ]

            const result = pagination.getPagination(currentPage, totalPages, '/test?page=')

            expect(result.items).to.deep.equal(paginationItems)
        })

        it('should return 1,...,8,[9],10 as items if currentPage is 9 and total pages is 10', function() {
            const currentPage = 9
            const totalPages = 10
            const paginationItems = [
                { number: 1, url: '/test?page=0' },
                { ellipsis: true },
                { number: 8, url: '/test?page=7' },
                { number: 9, url: '/test?page=8', current: true },
                { number: 10, url: '/test?page=9' }
            ]

            const result = pagination.getPagination(currentPage, totalPages, '/test?page=')

            expect(result.items).to.deep.equal(paginationItems)
        })

        it('should return 1,...,9,[10] as items if currentPage is 10 and total pages is 10', function() {
            const currentPage = 10
            const totalPages = 10
            const paginationItems = [
                { number: 1, url: '/test?page=0' },
                { ellipsis: true },
                { number: 9, url: '/test?page=8'},
                { number: 10, url: '/test?page=9', current: true  }
            ]

            const result = pagination.getPagination(currentPage, totalPages, '/test?page=')

            expect(result.items).to.deep.equal(paginationItems)
        })
    })

})