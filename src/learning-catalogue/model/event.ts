import {IsNotEmpty, IsPositive, MinDate} from 'class-validator'

export class Event {
	id: string

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.date'],
		message: 'validation.module.event.date.empty',
	})
	@MinDate(new Date(Date.now()), {
		groups: ['all', 'event.all', 'event.date'],
		message: 'validation.module.event.date.past',
	})
	date: Date

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.location'],
		message: 'validation.module.event.location.empty',
	})
	location: string

	@IsNotEmpty({
		groups: ['all', 'event.all', 'event.capacity'],
		message: 'validation.module.event.capacity.empty',
	})
	@IsPositive({
		groups: ['all', 'event.all', 'event.capacity'],
		message: 'validation.module.event.capacity.positive',
	})
	capacity: number
}
