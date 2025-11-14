import {OrganisationalUnitNode} from './organisationalUnitNode'
import {Type} from 'class-transformer'

export class OrganisationalUnitTree {

	@Type(() => OrganisationalUnitNode)
	public organisationalUnits: OrganisationalUnitNode[]

}
