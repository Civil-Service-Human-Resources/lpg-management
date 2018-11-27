import {IsNotEmpty} from 'class-validator'

export class OrganisationalUnit {
	id: string

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'organisations.validation.name.empty',
	})
	name: string

	@IsNotEmpty({
		groups: ['all', 'code'],
		message: 'organisations.validation.code.empty',
	})
	code: string

	abbreviation: string

	paymentMethods: string[]

	subOrgs: OrganisationalUnit[] // should be string[]

	parent: string
}
