import { OrganisationalUnit } from "./organisationalUnit";

export class OrganisationalUnitTypeAhead {

    constructor(public typeahead: OrganisationalUnit[]) { }

    getAsTree(): OrganisationalUnit[] {
		const map: Map<number, number> = new Map()
		const roots: OrganisationalUnit[] = []

		for (let i = 0; i < this.typeahead.length; i++) {
			map.set(this.typeahead[i].id, i)
			this.typeahead[i].children = []
		}

		for (const org of this.typeahead) {
			if (org.parentId != null) {
				this.typeahead[map.get(org.parentId)!].children.push(org)
			} else {
				roots.push(org)
			}
		}

		return roots
	}

    async upsertAndSort(typeaheadElement: OrganisationalUnit) {
        const index = this.typeahead.findIndex(o => o.id === typeaheadElement.id)
        if (index === -1) {
            this.typeahead.push(typeaheadElement)
        } else {
            this.typeahead[index] = typeaheadElement
        }
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

}