import {Module} from './module'
import {IsNotEmpty} from 'class-validator'

export class ELearningModule extends Module {
	@IsNotEmpty({
		groups: ['all', 'startPage'],
		message: 'validation.module.startPage.empty',
	})
	startPage: string

	type: Module.Type.E_LEARNING

	url: string
}
