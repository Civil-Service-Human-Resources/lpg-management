import { expect } from "chai"
import { OrganisationalUnitTypeAhead } from "../../../../../src/csrs/model/organisationalUnitTypeAhead"
import { getOrg } from "../../utils"

describe('OrganisationalUnitTypeAhead tests', () => {
    describe('getAsTree tests', () => {
        it('Should return organisations in a tree format', async () => {
            const orgs = [
                getOrg("A", "A", 1),
                getOrg("B", "A | B", 2, 1),
                getOrg("C", "A | C", 3, 1),
                getOrg("D", "A | C | D", 4, 3)
            ]
            const typeahead = new OrganisationalUnitTypeAhead(orgs)
            const result = typeahead.getAsTree()
            expect(result[0].name).to.eql("A")
            expect(result[0].children[0].name).to.eql("B")
            expect(result[0].children[1].name).to.eql("C")
            expect(result[0].children[1].children[0].name).to.eql("D")
        })
    })

    describe('addFormattedNameAndSort tests', () => {
		it('Should create a typeahead list sorted by formattedName', async () => {
			const grandparentOrg = getOrg("E", '', 5, undefined)
			const parentOrg = getOrg("B", '', 2, 1)
			const childOrg = getOrg("D", '', 4, 2)
			const parentOrg2 = getOrg("C", '', 3, 1)
			const grandparentOrg2 = getOrg("A", '', 1, undefined)
			const orgs = [grandparentOrg, childOrg, parentOrg, parentOrg2, grandparentOrg2]
			const typeahead = OrganisationalUnitTypeAhead.createAndSort(orgs)
			const list = typeahead.typeahead
			expect(list.map(o => o.formattedName)).to.eql([
				"A",
				"A | B",
				"A | B | D",
				"A | C",
				"E"
			])
		})

		it('Should create a typeahead list sorted by formattedName, including abbreviations', async () => {
			const grandparentOrg = getOrg("Ministry of Defence", '', 5, undefined, "MOD")
			const parentOrg = getOrg("Government Business Services", '', 2, 1, "GBS")
			const childOrg = getOrg("Platforms and Services", '', 4, 2, "PaSO")
			const parentOrg2 = getOrg("Government Digital Services", '', 3, 1, "GDS")
			const grandparentOrg2 = getOrg("Cabinet Office", '', 1, undefined, "CO")
			const orgs = [grandparentOrg, childOrg, parentOrg, parentOrg2, grandparentOrg2]
			const typeahead = OrganisationalUnitTypeAhead.createAndSort(orgs)
			const list = typeahead.typeahead
			expect(list.map(o => o.formattedName)).to.eql([
				"Cabinet Office (CO)",
				"Cabinet Office (CO) | Government Business Services (GBS)",
				"Cabinet Office (CO) | Government Business Services (GBS) | Platforms and Services (PaSO)",
				"Cabinet Office (CO) | Government Digital Services (GDS)",
				"Ministry of Defence (MOD)"
			])
		})
	})

	describe('removeAndSort tests', () => {
		it('Should delete an organisation and format/sort the remaining organisations', async () => {
			const parentOrg = getOrg("Parent", '', 1, undefined, "PARENT")
			const childOrg = getOrg("Child", '', 2, 1, "CHILD")
			const siblingOrg = getOrg("Sibling", '', 3, 1, "SIBLING")
			const orgs = [parentOrg, childOrg, siblingOrg]
			const typeahead = OrganisationalUnitTypeAhead.createAndSort(orgs)
			typeahead.removeAndSort(1)
			expect(typeahead.typeahead.length).to.eql(2)
			expect(typeahead.typeahead[0].formattedName).to.eql('Child (CHILD)')
			expect(typeahead.typeahead[0].parentId).to.eql(null)
			expect(typeahead.typeahead[1].formattedName).to.eql('Sibling (SIBLING)')
			expect(typeahead.typeahead[1].parentId).to.eql(null)
		})
	})
})