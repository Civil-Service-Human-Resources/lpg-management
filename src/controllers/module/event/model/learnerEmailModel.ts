import {IsEmail, IsNotEmpty} from 'class-validator'

export class LearnerEmailModel {

	@IsNotEmpty({
		message: 'validation_email_address_empty',
	})
	@IsEmail({}, {
		message: 'validation_email_address_invalid'
	})
	learnerEmail: string
}