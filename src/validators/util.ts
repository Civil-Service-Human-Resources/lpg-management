import {validate} from 'class-validator'
import {ValidationErrorMapper} from '../learning-catalogue/validator/validationErrorMapper'

export async function validateAndMapErrors(object: any) {
	let errors = undefined
	const validationErrors = await validate(object, { skipMissingProperties: false })
	if (validationErrors.length > 0) {
		errors = ValidationErrorMapper.map(validationErrors)
	}
	return errors
}
