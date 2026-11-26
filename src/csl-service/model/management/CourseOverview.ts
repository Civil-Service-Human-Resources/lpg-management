import {Expose, Transform, Type} from 'class-transformer'
import {Status} from '../../../learning-catalogue/model/status'
import {Visibility} from '../../../learning-catalogue/model/visibility'
import {courseType} from '../../../learning-catalogue/model/types'
import {LearningTag} from '../../../learning-catalogue/model/learningTag/learningTag'
import {FaceToFaceModuleOverview, ModuleOverview} from './ModuleOverview'
import {FRONTEND} from '../../../config'
import {courseLevel} from '../../../learning-catalogue/model/courseLevel'
import {AudienceOverview} from './AudienceOverview'
import _ = require('lodash')

export const sortAudiences = (audiences: AudienceOverview[]) => {
	// sorts into order: [audiences with >0 departments], [audiences with >0 areas of work], [audiences with >0 interests], then alphabetically ascending order

	let sortFunction = (audience1: AudienceOverview, audience2: AudienceOverview) => {
		return audience1.name > audience2.name ? 1 : -1
	}
	let audiencesWithDepartments: AudienceOverview[] = []
	let audiencesWithAreasOfWork: AudienceOverview[] = []
	let audiencesWithInterests: AudienceOverview[] = []
	let audiencesWithNone: AudienceOverview[] = []

	for (let audience of audiences) {
		if (Array.isArray(audience.organisations) && audience.organisations.length) {
			audiencesWithDepartments.push(audience)
			continue
		}

		if (Array.isArray(audience.areasOfWork) && audience.areasOfWork.length) {
			audiencesWithAreasOfWork.push(audience)
			continue
		}

		if (Array.isArray(audience.interests) && audience.interests.length) {
			audiencesWithInterests.push(audience)
			continue
		}

		audiencesWithNone.push(audience)
	}

	audiencesWithDepartments.sort(sortFunction)
	audiencesWithAreasOfWork.sort(sortFunction)
	audiencesWithInterests.sort(sortFunction)
	audiencesWithNone.sort(sortFunction)

	let sortedAudiences: AudienceOverview[] = []
	sortedAudiences.push(...audiencesWithDepartments, ...audiencesWithAreasOfWork, ...audiencesWithInterests, ...audiencesWithNone)

	return sortedAudiences
}

export class CourseOverview {
	public id: string
	public title: string
	public description: string
	public learningOutcomes: string
	@Transform(({value}) => {
		return _.capitalize(value)
	})
	public status: Status
	public type: courseType
	public visibility: Visibility
	public level: courseLevel
	public duration: number
	@Type(() => LearningTag)
	public learningTags: LearningTag[]
	public grades: string[]
	public areasOfWork: string[]
	public costInPounds: number
	public hasBeenPublished?: boolean

	public canBeDeleted(): boolean {
		return this.status === Status.DRAFT && !!this.hasBeenPublished
	}

	@Transform(({value, obj}) => {
		;(value as ModuleOverview[]).forEach(m => (m.courseId = obj.id))
		return value
	})
	@Type(() => ModuleOverview)
	public modules: ModuleOverview[]
	public nextAvailableDate: string

	@Type(() => FaceToFaceModuleOverview)
	public faceToFaceModuleOverviews: FaceToFaceModuleOverview[]

	@Type(() => AudienceOverview)
	@Transform(({value}) => sortAudiences(value))
	public audiences: AudienceOverview[]

	@Expose()
	@Transform(({obj}) => {
		return `${FRONTEND.LPG_UI_URL}/courses/${obj.id}`
	})
	public courseUrl: string
}