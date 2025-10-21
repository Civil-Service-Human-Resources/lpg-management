export class SubmittableForm {
	public errors?: {fields: {[name: string]: string[]}}

	constructor(errors?: {fields: {[name: string]: string[]}}) {
		this.errors = errors
	}

	addError(error: {[name: string]: string[]}) {
		if (this.errors !== undefined) {
			for (const field of Object.keys(error)) {
				if (this.errors.fields[field] !== undefined) {
					this.errors.fields[field].push(...error[field])
				}
			}
		}
	}

	hasErrors() {
		return this.errors !== undefined && Object.keys(this.errors.fields).length > 0;
	}
}
