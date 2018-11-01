import {Module} from './module'
import {IsIn, IsNotEmpty, MaxLength} from 'class-validator'
import {Audience} from './audience'
import {LearningProvider} from './learningProvider'
import {Status} from './status'

export class Course {
	id: string

	@IsNotEmpty({
		groups: ['all', 'title'],
		message: 'course.validation.title.empty',
	})
	title: string

	@IsNotEmpty({
		groups: ['all', 'shortDescription'],
		message: 'course.validation.shortDescription.empty',
	})
	@MaxLength(160, {
		groups: ['all', 'shortDescription'],
		message: 'course.validation.shortDescription.maxLength',
	})
	shortDescription: string

	@IsNotEmpty({
		groups: ['all', 'description'],
		message: 'course.validation.description.empty',
	})
	@MaxLength(1500, {
		groups: ['all', 'description'],
		message: 'course.validation.description.maxLength',
	})
	description: string

	duration: number
	learningOutcomes: string
	preparation: string
	modules: Module[]
	audiences: Audience[]
	learningProvider: LearningProvider

	@IsIn(['Draft', 'Published', 'Archived'], {
		groups: ['all', 'status'],
		message: 'course.validation.status.invalid',
	})
	status: Status = Status.DRAFT

	getCost() {
		return this.modules.map(module => module.cost).reduce((acc: number, moduleCost) => acc + (moduleCost || 0), 0)
	}

	getType() {
		return this.modules.length > 1 ? 'blended' : this.modules.length == 1 ? this.modules[0].type : undefined
	}
}
