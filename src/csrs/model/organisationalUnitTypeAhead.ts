import { OrganisationalUnit } from "./organisationalUnit";
import { OrganisationalUnitTypeAheadElement } from "./organisationalUnitTypeAheadElement";

export class OrganisationalUnitTypeAhead {

    constructor(public typeahead: OrganisationalUnitTypeAheadElement[]) { }
    

    insertAndSort(typeaheadElement: OrganisationalUnitTypeAheadElement) {
        this.typeahead.push(typeaheadElement)
        this.sort()
    }

    removeElement(organisationalUnitId: number) {
        const index = this.typeahead.findIndex(o => o.id === organisationalUnitId)
        this.typeahead.splice(index, 1)
    }

    sort() {
        const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
        this.typeahead.sort((a, b) => { return collator.compare(a.formattedName, b.formattedName)})
    }

    getDomainFilteredList(domain: string) {
        let filteredOrgs = this.typeahead.filter(o => o.agencyDomains.includes(domain))
		if (filteredOrgs.length > 0) {
			return filteredOrgs
		}
        return this.typeahead
    }

    static fromOrganisationalUnits(organisationalUnits: OrganisationalUnit[]) {
        const convertedOrgUnits = organisationalUnits.map(OrganisationalUnitTypeAheadElement.fromOrgnaisationalUnit)
        return new OrganisationalUnitTypeAhead(convertedOrgUnits)
    }
}