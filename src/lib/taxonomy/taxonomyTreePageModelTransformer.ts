import {ClassConstructor, Type} from 'class-transformer'
import {TaxonomyTreePageModel} from './taxonomyTreePageModel'

export function TransformToTaxonomyNode <T extends TaxonomyTreePageModel> (pageModelClass: ClassConstructor<T>) {
	return Type(() => pageModelClass)
}