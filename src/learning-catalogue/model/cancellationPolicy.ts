import {IsNotEmpty} from 'class-validator'

export class CancellationPolicy {
	public id: string

	@IsNotEmpty({
		groups: ['all', 'name'],
		message: 'validation.cancellationPolicy.name.empty',
	})
	public name: string

	@IsNotEmpty({
		groups: ['all', 'shortVersion'],
		message: 'validation.cancellationPolicy.shortVersion.empty',
	})
	public shortVersion: string

	@IsNotEmpty({
		groups: ['all', 'fullVersion'],
		message: 'validation.cancellationPolicy.fullVersion.empty',
	})
	public fullVersion: string

	public dateAdded: string
}
