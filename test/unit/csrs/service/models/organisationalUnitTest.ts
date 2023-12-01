import { expect } from "chai"
import { Domain } from "../../../../../src/csrs/model/domain"
import { OrganisationalUnitPageModel } from "../../../../../src/csrs/model/organisationalUnitPageModel"
import { getOrg } from "../../utils"

describe('OrganisationalUnit tests', () => {
    describe('getHierarchyArray tests', () => {
        it('Should build the hierarchy correctly', () => {
            const grandparent = getOrg("grandparent", "grandparent", 1)
            const parent = getOrg("parent", "grandparent | parent", 2, 1)
            const child = getOrg("child", "grandparent | parent | child", 3, 2)
            parent.parent = grandparent
            child.parent = parent
            const array = child.getHierarchyAsArray()
            expect(array[0].name).to.eql("child")
            expect(array[1].name).to.eql("parent")
            expect(array[2].name).to.eql("grandparent")
        })
    })

	describe('getOrgAndChildren tests', () => {
        it('Should build the reverse hierarchy correctly', () => {
            const grandparent = getOrg("grandparent", "grandparent", 1)
            const parent = getOrg("parent", "grandparent | parent", 2, 1)
            const child = getOrg("child", "grandparent | parent | child", 3, 2)
			parent.children = [child]
			grandparent.children = [parent]
            parent.parent = grandparent
            child.parent = parent
            const array = grandparent.getOrgAndChildren()
            expect(array[0].name).to.eql("grandparent")
            expect(array[1].name).to.eql("parent")
            expect(array[2].name).to.eql("child")
        })
    })

	describe('updateWithPageModel tests', () => {
        it('Should update the organisational unit with the page model correctly, without a parentID', () => {
            const org = getOrg("ORG", "ORG", 1)
			org.abbreviation = "ABBREV"
			org.code = "CODE"
			const model: OrganisationalUnitPageModel = {
				code: "NEW_CODE",
				name: "NEW_NAME",
				parentId: 0,
				abbreviation: "NEW_ABBREV"
			}
			org.updateWithPageModel(model)
			expect(org.name).to.eql("NEW_NAME")
			expect(org.code).to.eql("NEW_CODE")
			expect(org.abbreviation).to.eql("NEW_ABBREV")
			expect(org.parentId).to.eql(null)
			expect(org.parent).to.eql(undefined)
        })
    })

	describe('insertAndSortDomain tests', () => {
		it('Should insert the domain and sort the resulting list', () => {
			const org = getOrg("ORG", "ORG", 1)
			org.domains = [new Domain(1, "domain.com"),
					new Domain(2, "z-domain.com"),
					new Domain(3, "a-domain.com")]
			org.insertAndSortDomain(new Domain(6, "h-domain.com"))
			const arr = Array.from(org.domains)
			expect(arr.length).eql(4)
			expect(arr[0].domain).eql("a-domain.com")
			expect(arr[1].domain).eql("domain.com")
			expect(arr[2].domain).eql("h-domain.com")
			expect(arr[3].domain).eql("z-domain.com")
		})
		it('Should NOT insert and sort the domain if it already exists', () => {
			const org = getOrg("ORG", "ORG", 1)
			org.domains = [new Domain(1, "domain.com"),
				new Domain(2, "z-domain.com"),
				new Domain(3, "a-domain.com")]
			org.insertAndSortDomain(new Domain(3, "a-domain.com"))
			const arr = Array.from(org.domains)
			expect(arr.length).eql(3)
			expect(arr[0].domain).eql("domain.com")
			expect(arr[1].domain).eql("z-domain.com")
			expect(arr[2].domain).eql("a-domain.com")
		})
	})

	describe('doesDomainExist tests', () => {
		it('Should return true if the domain exists', () => {
			const org = getOrg("ORG", "ORG", 1)
			org.domains = [new Domain(1, "domain.com"),
					new Domain(2, "z-domain.com"),
					new Domain(3, "a-domain.com")]
			expect(org.doesDomainExist("z-domain.com")).to.be.true
		})
	})

	describe('deleteDomain tests', () => {
		it('Should delete a domain', () => {
			const org = getOrg("ORG", "ORG", 1)
			org.domains = [new Domain(1, "domain.com"),
				new Domain(2, "z-domain.com"),
				new Domain(3, "a-domain.com")]
			org.removeDomain(2)
			const arr = Array.from(org.domains)
			expect(arr.length).eql(2)
			expect(arr[0].domain).eql("domain.com")
			expect(arr[1].domain).eql("a-domain.com")
		})
	})
})
