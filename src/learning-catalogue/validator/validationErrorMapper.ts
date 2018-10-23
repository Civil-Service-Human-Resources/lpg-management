import {ValidationError} from 'class-validator'

export class ValidationErrorMapper {
	static map(validationErrors: ValidationError[], fields: any = {}) {
		validationErrors.map(x => this.map(x.children, fields))
		validationErrors.filter(x => x.constraints).map(x => {
			fields[x.property] = Object.values(x.constraints)
		})

		return {
			fields: fields,
			size: [].concat.apply([], Object.values(fields)).length,
		}
	}
}
