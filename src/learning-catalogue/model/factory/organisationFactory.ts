import {Organisation} from '../organisation'
import {Factory} from './factory'

export class OrganisationFactory extends Factory<Organisation> {
	create(data: any) {
		const organisation: Organisation = new Organisation()

		organisation.id = data.id
		organisation.name = data.name
		organisation.code = data.code
		organisation.abbreviation = data.abbreviation

		return organisation
	}
}
