import {ArrayNotEmpty, IsNotEmpty, MaxLength} from 'class-validator'

export class Audience {
	@IsNotEmpty({
		groups: ['all', 'audience.all', 'audience.name'],
		message: 'audience.validation.name.empty',
	})
	@MaxLength(40, {
		groups: ['all', 'audience.all', 'audience.name'],
		message: 'audience.validation.name.maxLength',
	})
	name: string

	@ArrayNotEmpty({
		groups: ['all', 'audience.all', 'audience.areasOfWork'],
		message: 'validation.module.areasOfWork.empty',
	})
	areasOfWork: string[]

	@ArrayNotEmpty({
		groups: ['all', 'audience.all', 'audience.departments'],
		message: 'validation.module.departments.empty',
	})
	departments: string[]

	@ArrayNotEmpty({
		groups: ['all', 'audience.all', 'audience.grades'],
		message: 'validation.module.grades.empty',
	})
	grades: string[]

	@ArrayNotEmpty({
		groups: ['all', 'audience.all', 'audience.interests'],
		message: 'validation.module.interests.empty',
	})
	interests: string[]

	@IsNotEmpty({
		groups: ['all', 'audience.all', 'audience.mandatory'],
		message: 'validation.module.mandatory.empty',
	})
	mandatory: boolean

	requiredBy?: Date | null
	frequency?: string | null
}
