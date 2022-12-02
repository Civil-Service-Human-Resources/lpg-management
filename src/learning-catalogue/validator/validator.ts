import {validate, ValidationError} from 'class-validator'
import {ValidationErrorMapper} from './validationErrorMapper'
import {Factory} from '../model/factory/factory'

export class Validator<T> {
	factory: Factory<T>

	constructor(factory: Factory<T>) {
		this.factory = factory
	}

	async check(params: any, groups: string[] = ['all']) {
		const validationErrors: ValidationError[] = await validate(this.factory.create(params), {
			groups: groups,
		})

		return ValidationErrorMapper.map(validationErrors)
	}
}