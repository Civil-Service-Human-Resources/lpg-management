import {IsIn, IsNotEmpty, IsOptional, IsPositive, Min} from 'class-validator'
import {Event} from './event'

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
		message: 'validation_module_description_empty',
	})
	description: string

	@IsPositive({
		groups: ['all', 'duration'],
		message: 'validation.module.duration.positive',
	})
	@IsNotEmpty({
		groups: ['all', 'duration'],
		message: 'validation.module.duration.empty',
	})
	duration: number

	formattedDuration: string

	@IsOptional({
		groups: ['all', 'cost'],
		message: 'module.validation.cost.positive',
	})
	@Min(0, {
		groups: ['all', 'cost'],
		message: 'module.validation.cost.positive',
	})
	cost?: number

	optional: boolean

	events: Event[]
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
