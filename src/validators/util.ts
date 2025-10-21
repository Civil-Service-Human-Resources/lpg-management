import {validate} from 'class-validator'
import {ValidationErrorMapper} from '../learning-catalogue/validator/validationErrorMapper'

export async function validateAndMapErrors(object: any, groups?: string[]): Promise<{fields: {[name: string]: string[]}} | undefined> {
	const validationErrors = await validate(object, { skipMissingProperties: false, groups })
	console.log(groups)
	console.log(validationErrors)
	if (validationErrors.length > 0) {
		const errors = ValidationErrorMapper.map(validationErrors)
		Object.keys(errors.fields).forEach(k => {
			const v = errors.fields[k]
			if (v.length > 1) {
				errors.fields[k] = [v[0]]
			}
		})
		return errors
	}
}
