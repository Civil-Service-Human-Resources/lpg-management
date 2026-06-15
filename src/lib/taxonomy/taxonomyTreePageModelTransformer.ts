import {ClassConstructor, Type} from 'class-transformer'
import {TaxonomyTreePageModel} from 'lib/taxonomy/taxonomyTreePageModel'

export function TransformToTaxonomyNode <T extends TaxonomyTreePageModel> (pageModelClass: ClassConstructor<T>) {
	return Type(() => pageModelClass)
}