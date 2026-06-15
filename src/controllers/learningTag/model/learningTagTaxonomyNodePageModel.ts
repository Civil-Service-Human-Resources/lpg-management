import {TaxonomyTreePageModel} from 'lib/taxonomy/taxonomyTreePageModel'
import {Expose, Transform, Type} from 'class-transformer'

export class LearningTagTaxonomyNodePageModel implements TaxonomyTreePageModel {

	@Type(() => LearningTagTaxonomyNodePageModel)
	children: LearningTagTaxonomyNodePageModel[]
	id: string
	name: string
	@Transform(({value, obj}) => {
		return `/content-management/learning-tags/${obj.id}/overview`
	})
	@Expose()
	public url: string

}