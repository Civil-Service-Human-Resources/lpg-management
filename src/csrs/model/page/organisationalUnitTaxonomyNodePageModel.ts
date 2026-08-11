import {Expose, Transform, Type} from 'class-transformer'
import {TaxonomyTreePageModel} from '../../../lib/taxonomy/taxonomyTreePageModel'

export class OrganisationalUnitTaxonomyNodePageModel implements TaxonomyTreePageModel {

	@Type(() => OrganisationalUnitTaxonomyNodePageModel)
	children: OrganisationalUnitTaxonomyNodePageModel[]
	id: string
	name: string
	@Transform(({value, obj}) => {
		return `/content-management/organisations/${obj.id}/overview`
	})
	@Expose()
	public url: string

}