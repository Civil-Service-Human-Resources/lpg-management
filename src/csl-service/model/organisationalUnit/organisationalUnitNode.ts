import {Type} from 'class-transformer'

export class OrganisationalUnitNode {

	public name: string
	public id: number

	@Type(() => OrganisationalUnitNode)
	public children: OrganisationalUnitNode[] = []


	constructor(name: string, id: number, children: OrganisationalUnitNode[]) {
		this.name = name
		this.id = id
		this.children = children
	}
}
