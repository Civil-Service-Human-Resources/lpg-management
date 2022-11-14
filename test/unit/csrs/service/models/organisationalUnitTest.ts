import { expect } from "chai"
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
})