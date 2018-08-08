import {Module} from '../model/module'
import {ModuleFactory} from '../model/factory/moduleFactory'
import {EventFactory} from '../model/factory/eventFactory'
import {AudienceFactory} from '../model/factory/audienceFactory'
import {RestService} from './restService'

export class ModuleService {
	private _restService: RestService
	private _moduleFactory: ModuleFactory

	constructor(restService: RestService) {
		this._restService = restService
		this._moduleFactory = new ModuleFactory(
			new AudienceFactory(),
			new EventFactory()
		)
	}

	async create(courseId: string, module: Module): Promise<Module> {
		const data = await this._restService.post(
			`/courses/${courseId}/modules`,
			module
		)

		return this._moduleFactory.create(data)
	}

	async get(courseId: string, moduleId: string): Promise<Module> {
		const data = await this._restService.get(
			`/courses/${courseId}/modules/${moduleId}`
		)

		return this._moduleFactory.create(data)
	}

	set moduleFactory(value: ModuleFactory) {
		this._moduleFactory = value
	}
}
