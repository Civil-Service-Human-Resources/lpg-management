import {TaxonomyTreeNode} from './taxonomyTreeNode'
import {Type} from 'class-transformer'

export class TaxonomyTree {

	@Type(() => TaxonomyTreeNode)
	public content: TaxonomyTreeNode[]

}
