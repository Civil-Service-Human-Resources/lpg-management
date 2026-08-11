import {Type} from 'class-transformer'

export class TaxonomyTreeNode {

	public name: string
	public id: number
	public archived: boolean

	@Type(() => TaxonomyTreeNode)
	public children: TaxonomyTreeNode[] = []

	constructor(name: string, id: number, children: TaxonomyTreeNode[], archived: boolean) {
		this.name = name
		this.id = id
		this.children = children
		this.archived = archived
	}
}
