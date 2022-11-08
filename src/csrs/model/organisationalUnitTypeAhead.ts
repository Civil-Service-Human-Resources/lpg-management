import { OrganisationalUnit } from "./organisationalUnit";

export class OrganisationalUnitTypeAhead {

    constructor(public typeahead: OrganisationalUnit[]) { }

    upsertAndSort(typeaheadElement: OrganisationalUnit) {
        const index = this.typeahead.findIndex(o => o.id === typeaheadElement.id)
        if (index === -1) {
            this.typeahead.push(typeaheadElement)
        } else {
            this.typeahead[index] = typeaheadElement
        }
        this.sort()
    }
    
    // updateAndSort(typeaheadElement: OrganisationalUnit) {
    //     const index = this.typeahead.findIndex(o => o.id === typeaheadElement.id)
    //     this.typeahead[index] = typeaheadElement
    //     this.sort()
    // }

    // insertAndSort(typeaheadElement: OrganisationalUnit) {
    //     this.typeahead.push(typeaheadElement)
    //     this.sort()
    // }

    removeElement(organisationalUnitId: number) {
        const index = this.typeahead.findIndex(o => o.id === organisationalUnitId)
        this.typeahead.splice(index, 1)
    }

    sort() {
        const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
        this.typeahead.sort((a, b) => { return collator.compare(a.formattedName, b.formattedName)})
    }

    getDomainFilteredList(domain: string) {
        let filteredOrgs = this.typeahead.filter(o => {
            o.agencyToken ? o.agencyToken.agencyDomains.map(a => a.domain).includes(domain) : false
        })
		if (filteredOrgs.length > 0) {
			return filteredOrgs
		}
        return this.typeahead
    }
}