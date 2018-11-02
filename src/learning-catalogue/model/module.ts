import {IsNotEmpty, IsOptional, IsPositive} from 'class-validator'

export class Module {
	id: string

	type: Module.Type

	@IsNotEmpty({
		groups: ['all', 'title'],
		message: 'validation_module_title_empty',
	})
	title: string

	@IsNotEmpty({
		groups: ['all', 'description'],
		message: 'validation_module_description_empty',
	})
	description: string

	duration: number

	formattedDuration: string

	@IsOptional({
		groups: ['all', 'cost'],
		message: 'module.validation.cost.positive',
	})
	@IsPositive({
		groups: ['all', 'cost'],
		message: 'module.validation.cost.positive',
	})
	cost?: number

	optional: boolean
}

export namespace Module {
	export enum Type {
		FACE_TO_FACE = 'face-to-face',
		LINK = 'link',
		VIDEO = 'video',
		E_LEARNING = 'elearning',
		FILE = 'file',
	}
}
