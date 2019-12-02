import {IsFutureDate} from '../validator/custom/isFutureDate'
import {IsDate, IsNotEmpty, MaxLength} from 'class-validator'
import {Duration} from 'moment'

export class Audience {
	id: string

	@IsNotEmpty({
		groups: ['all', 'audience.all', 'audience.name'],
		message: 'audience.validation.name.empty',
	})
	@MaxLength(40, {
		groups: ['all', 'audience.all', 'audience.name'],
		message: 'audience.validation.name.maxLength',
	})
	name: string

	areasOfWork?: string[]

	departments?: string[]

	grades?: string[]

	interests?: string[]

	@IsNotEmpty({
		groups: ['all', 'audience.all', 'audience.type'],
		message: 'audience.validation.type.empty',
	})
	type: Audience.Type

	@IsFutureDate({
		groups: ['all', 'audience.all', 'audience.requiredBy'],
		message: 'audience.validation.requiredBy.dateIsNotInFuture',
	})
	@IsDate({
		groups: ['all', 'audience.all', 'audience.requiredBy'],
		message: 'audience.validation.requiredBy.invalidDate',
	})
	requiredBy?: Date

	frequency?: Duration

	eventId?: string
}

export namespace Audience {
	export enum Type {
		OPEN = 'OPEN',
		REQUIRED_LEARNING = 'REQUIRED_LEARNING',
	}
}
