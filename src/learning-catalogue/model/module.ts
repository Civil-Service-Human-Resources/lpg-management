import {Audience} from './audience'
import {IsIn, IsNotEmpty, IsPositive, ValidateNested} from 'class-validator'

export class Module {
	id: string

	@IsNotEmpty({
		groups: ['all', 'type'],
		message: 'validation.module.type.empty',
	})
	@IsIn(['face-to-face', 'link', 'video', 'elearning', 'file'], {
		groups: ['all', 'type'],
		message: 'validation.module.type.validType',
	})
	type: Module.Type

	@IsNotEmpty({
		groups: ['all', 'title'],
		message: 'validation_module_title_empty',
	})
	title: string

	@IsNotEmpty({
		groups: ['all', 'description'],
		message: 'validation.module.description.empty',
	})
	description: string

	@IsNotEmpty({
		groups: ['all', 'duration'],
		message: 'validation.module.duration.empty',
	})
	@IsPositive({
		groups: ['all', 'duration'],
		message: 'validation.module.duration.positive',
	})
	duration: number

	price?: number

	optional: boolean

	@ValidateNested({
		groups: ['all', 'audiences'],
	})
	audiences: Audience[]
}

export namespace Module {
	export enum Type {
		FACE_TO_FACE = 'face-to-face',
		LINK = 'link' ,
		VIDEO = 'video',
		E_LEARNING = 'elearning',
		FILE = 'file'
	}
}