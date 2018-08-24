import {validate, ValidationError} from 'class-validator'
import {ValidationErrorMapper} from './validationErrorMapper'
import {Factory} from '../model/factory/factory'

export class Validator<T> {
	private _validationErrorMapper: ValidationErrorMapper = new ValidationErrorMapper()
	private _factory: Factory<T>

	constructor(factory: Factory<T>) {
		this._factory = factory
	}

	get validationErrorMapper(): ValidationErrorMapper {
		return this._validationErrorMapper
	}

	set validationErrorMapper(value: ValidationErrorMapper) {
		this._validationErrorMapper = value
	}

	get learningProviderFactory(): Factory<T> {
		return this._factory
	}

	set learningProviderFactory(value: Factory<T>) {
		this._factory = value
	}

	get moduleFactory(): Factory<T> {
		return this._factory
	}

	set moduleFactory(value: Factory<T>) {
		this._factory = value
	}

	async check(params: any, groups: string[] = ['all']) {
		const validationErrors: ValidationError[] = await validate(this._factory.create(params), {
			groups: groups,
		})

		return this._validationErrorMapper.map(validationErrors)
	}
}
