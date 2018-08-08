import {validate, ValidationError} from 'class-validator'
import {ValidationErrorMapper} from './validationErrorMapper'
import {ModuleFactory} from '../model/factory/moduleFactory'
import {EventFactory} from '../model/factory/eventFactory'
import {AudienceFactory} from '../model/factory/audienceFactory'

export class ModuleValidator {
	private _validationErrorMapper: ValidationErrorMapper = new ValidationErrorMapper()
	private _moduleFactory: ModuleFactory = new ModuleFactory(
		new AudienceFactory(),
		new EventFactory()
	)

	get validationErrorMapper(): ValidationErrorMapper {
		return this._validationErrorMapper
	}

	set validationErrorMapper(value: ValidationErrorMapper) {
		this._validationErrorMapper = value
	}

	get moduleFactory(): ModuleFactory {
		return this._moduleFactory
	}

	set moduleFactory(value: ModuleFactory) {
		this._moduleFactory = value
	}

	async check(params: any, groups: string[] = ['all']) {
		const module = await this._moduleFactory.create(params)

		const validationErrors: ValidationError[] = await validate(module, {
			groups: groups,
		})

		return this._validationErrorMapper.map(validationErrors)
	}
}
