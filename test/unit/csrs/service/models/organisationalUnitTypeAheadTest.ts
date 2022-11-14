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

    describe('upsertAndSort tests', () => {
        it('Should insert and sort an organisation (by formattedName) if it is missing', async () => {
            const orgs = [
                getOrg("A", "A", 1),
                getOrg("B", "A | B", 2, 1),
                getOrg("C", "A | C", 3, 1),
                getOrg("D", "A | C | D", 4, 3)
            ]
            const orgToInsert = getOrg("AA", "A | AA", 5, 1)
            const typeahead = new OrganisationalUnitTypeAhead(orgs)
            typeahead.upsertAndSort(orgToInsert)
            
            expect(typeahead.typeahead[1].name).to.eql("AA")
        })

        it('Should update and sort an organisation (by formattedName) if it already exists', async () => {
            const orgs = [
                getOrg("A", "A", 1),
                getOrg("B", "A | B", 2, 1),
                getOrg("C", "A | C", 3, 1),
                getOrg("D", "A | C | D", 4, 3)
            ]
            const newUpdate = getOrg("CC", "CC", 2)
            const typeahead = new OrganisationalUnitTypeAhead(orgs)
            typeahead.upsertAndSort(newUpdate)
            
            expect(typeahead.typeahead[1].name).to.eql("C")
            expect(typeahead.typeahead[3].name).to.eql("CC")
        })
    })
    describe('removeElement tests', () => {
        it('Should update and sort an organisation (by formattedName) if it already exists', async () => {
            const orgs = [
                getOrg("A", "A", 1),
                getOrg("B", "A | B", 2, 1),
                getOrg("C", "A | C", 3, 1),
                getOrg("D", "A | C | D", 4, 3)
            ]
            const typeahead = new OrganisationalUnitTypeAhead(orgs)
            typeahead.removeElement(3)
            expect(typeahead.typeahead[0].name).to.eql("A")
            expect(typeahead.typeahead[1].name).to.eql("B")
            expect(typeahead.typeahead[2].name).to.eql("D")
        })
    })
})