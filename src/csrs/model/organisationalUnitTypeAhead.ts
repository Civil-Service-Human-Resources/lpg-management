import { Type } from "class-transformer";
import { OrganisationalUnit } from "./organisationalUnit";

export class OrganisationalUnitTypeAhead {

    @Type(() => OrganisationalUnit)
    public typeahead: OrganisationalUnit[]

    constructor(typeahead: OrganisationalUnit[]) {
        this.typeahead = typeahead
    }

    static createAndSort(typeahead: OrganisationalUnit[]) {
		const typeaheadObject = new OrganisationalUnitTypeAhead(typeahead)
		typeaheadObject.resetFormattedNameAndSort()
		return typeaheadObject
	}

	/**
	 * Create the typeahead from an organisationalUnit list.
	 * Calculate and append the formattedName, and sort by formattedName
	 */
	resetFormattedNameAndSort() {
		const tree = this.getAsTree()
		this.typeahead = this.applyFormattedNameToTreeAndFlatten(tree)


		// const orgMap: Map<number, OrganisationalUnit> = new Map()
		// this.typeahead.forEach(o => {
		// 	o.formattedName = ''
		// 	orgMap.set(o.id, o)
		// })
		// for (const org of this.typeahead) {
		// 	org.formattedName = this.getFormattedName(orgMap, org.id)
		// }
		this.sort()
	}

	// private getFormattedName(
	// 	orgMap: Map<number, OrganisationalUnit>, orgId: number) {
	// 	const org = orgMap.get(orgId)!
	// 	if (!org.formattedName) {
	// 		let formattedName = org.formatNameWithAbbrev()
	// 		if (org.parentId) {
	// 			const parentFormattedName = this.getFormattedName(orgMap, org.parentId)
	// 			formattedName = `${parentFormattedName} | ${formattedName}`
	// 		}
	// 		org.formattedName = formattedName
	// 		orgMap.set(org.id, org)
	// 	}
	// 	return org.formattedName
	// }

	private applyFormattedNameToTreeAndFlatten(tree: OrganisationalUnit[] = [],
		currentParent?: OrganisationalUnit, flattenedOrgs: OrganisationalUnit[] = []) {
		for (const org of tree) {
			const orgFullName = org.formatNameWithAbbrev()
			if (currentParent) {
				org.formattedName = `${currentParent.formattedName} | ${orgFullName}`
			} else {
				org.formattedName = orgFullName
			}
			if (org.children.length > 0) {
				this.applyFormattedNameToTreeAndFlatten(org.children, org, flattenedOrgs)
			}
			flattenedOrgs.push(org)
		}
		return flattenedOrgs
	}

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

    sort() {
        const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
        this.typeahead.sort((a, b) => { return collator.compare(a.formattedName, b.formattedName)})
    }

}