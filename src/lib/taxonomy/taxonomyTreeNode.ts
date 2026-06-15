import {Type} from 'class-transformer'

export class TaxonomyTreeNode {

	public name: string
	public id: number

	@Type(() => TaxonomyTreeNode)
	public children: TaxonomyTreeNode[] = []


	constructor(name: string, id: number, children: TaxonomyTreeNode[]) {
		this.name = name
		this.id = id
		this.children = children
	}
}
