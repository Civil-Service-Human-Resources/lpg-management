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
		const orgMap: Map<number, OrganisationalUnit> = new Map()
		this.typeahead.forEach(o => {
			o.children = []
			o.formattedName = ''
			orgMap.set(o.id, o)
		})
		for (const org of this.typeahead) {
			org.formattedName = this.getFormattedName(orgMap, org.id)
		}
		this.sort()
	}

	public getOrgWithChildren(organisationalUnitId: number) {
		const tree = this.getAsTree()
		const orgWithChildren = this.fetchOrgWithChildren(organisationalUnitId, tree)
		return orgWithChildren
	}

	public removeOrganisation(organisationalUnitId: number) {
		let deletedIds: number[] = []
		const org = this.getOrgWithChildren(organisationalUnitId)
		if (org) {
			const flattened = org.getOrgAndChildren()
			deletedIds = flattened.map(o => o.id)
			this.typeahead = this.typeahead.filter(o => !deletedIds.includes(o.id))
		}
		return deletedIds
	}

	private fetchOrgWithChildren(organisationalUnitId: number, tree: OrganisationalUnit[] = []): OrganisationalUnit | undefined {
		let foundOrg
		for (let i = 0; i < tree.length; i++) {
			const org = tree[i]
			if (org.id === organisationalUnitId) {
				return org
			}
			if (org.children) {
				foundOrg = this.fetchOrgWithChildren(organisationalUnitId, org.children)
				if (foundOrg) {
					return foundOrg
				}
			}
		}
	}

	public upsertAndSort(organisationalUnit: OrganisationalUnit) {
		const index = this.typeahead.findIndex(o => organisationalUnit.id === o.id)
		if (index > -1) {
			this.typeahead[index] = organisationalUnit
		} else {
			this.typeahead.push(organisationalUnit)
		}
		this.resetFormattedNameAndSort()
	}

	private getFormattedName(orgMap: Map<number, OrganisationalUnit>, orgId: number) {
		const org = orgMap.get(orgId)!
		if (!org.formattedName) {
			let formattedName = org.formatNameWithAbbrev()
			if (org.parentId) {
				const parentFormattedName = this.getFormattedName(orgMap, org.parentId)
				formattedName = `${parentFormattedName} | ${formattedName}`
			}
			org.formattedName = formattedName
			orgMap.set(org.id, org)
		}
		return org.formattedName
	}

    getAsTree(): OrganisationalUnit[] {
		const idMapping = this.typeahead.reduce((acc: {
			[key: number]: number
		}, el, i) => {
			el.children = []
			acc[el.id] = i
			return acc
		}, {})
		const roots: OrganisationalUnit[] = []

		this.typeahead.map(o => {
			if (o.parentId) {
				this.typeahead[idMapping[o.parentId]].children.push(o)
			} else {
				roots.push(o)
			}
		})
		return roots
	}

    sort() {
        const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
        this.typeahead.sort((a, b) => { return collator.compare(a.formattedName!, b.formattedName!)})
    }

}