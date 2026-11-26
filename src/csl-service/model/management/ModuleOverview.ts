import {Expose, Type} from 'class-transformer'
import {moduleType} from '../../../learning-catalogue/model/types'
import {EventOverview} from './EventOverview'

export class ModuleOverview {
	@Expose()
	public courseId: string
	public id: string
	public title: string
	public description: string
	public mandatory: boolean
	public associatedLearning: boolean
	public type: moduleType
	public duration: number
	public costInPounds: number
}

export class FaceToFaceModuleOverview extends ModuleOverview {
	@Type(() => EventOverview)
	public events: EventOverview[]
}