import {IsNotEmpty} from 'class-validator'

export class LearningProvider {
	public id: string

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'validation_learningProvider_name_empty',
	})
	public name: string

	public dateAdded: string
}
