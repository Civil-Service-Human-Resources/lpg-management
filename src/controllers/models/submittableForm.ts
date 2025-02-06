export class SubmittableForm {
	public errors?: {fields: any, size: any}

	constructor(errors?: {fields: any; size: any}) {
		this.errors = errors
	}
}
