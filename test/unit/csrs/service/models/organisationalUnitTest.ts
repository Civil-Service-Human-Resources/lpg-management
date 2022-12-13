import { expect } from "chai"
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
})