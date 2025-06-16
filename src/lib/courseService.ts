import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {Event} from '../learning-catalogue/model/event'
import {Module} from '../learning-catalogue/model/module'
import {FaceToFaceModule} from '../learning-catalogue/model/faceToFaceModule'
import {Audience} from '../learning-catalogue/model/audience'
import * as _ from 'lodash'

export class CourseService {
	learningCatalogue: LearningCatalogue

	constructor(learningCatalogue: LearningCatalogue) {
		this.learningCatalogue = learningCatalogue
	}

	async getCourseDropdown() {
		return (await this.learningCatalogue.getCourseTypeAhead()).typeahead
	}

	async sortModules(course: Course, moduleIds: string[]): Promise<Course> {
		if (course.modules.length !== moduleIds.length) {
			throw new Error(`Course modules length(${course.modules.length}) does not match module ids length(${moduleIds.length})`)
		}

		let modules: Module[] = []

		moduleIds.forEach(id => {
			const module: Module | undefined = course.modules.find(m => {
				return m.id === id
			})

			if (module) {
				modules.push(module)
			} else {
				throw new Error(`Module (id: ${id}) not found in course (id: ${course.id})`)
			}
		})

		course.modules = modules
		console.log()
		console.log("HERE")
		await this.learningCatalogue.updateModuleOrder(course.id, modules)

		return course
	}

	getAllEventsOnCourse(course: Course): Event[] {
		return course.modules
			.filter((module: Module) => module.type == Module.Type.FACE_TO_FACE)
			.filter((module: Module) => (<FaceToFaceModule>module).events)
			.reduce((arr: Event[], module: Module) => arr.concat((<FaceToFaceModule>module).events), [])
	}

	getAudienceIdToEventMapping(course: Course) {
		const allEventsOnCourse = this.getAllEventsOnCourse(course)
		return course.audiences.reduce((map: any, audience: Audience) => {
			map[audience.id] = audience.eventId ? allEventsOnCourse.filter((event: Event) => event.id == audience.eventId)[0] : null
			return map
		}, {})
	}

	getEventIdToModuleIdMapping(course: Course) {
		return course.modules
			.filter((module: Module) => module.type == Module.Type.FACE_TO_FACE)
			.filter((module: Module) => (<FaceToFaceModule>module).events)
			.reduce((map: any, module: Module) => {
				;(<FaceToFaceModule>module).events.reduce((map: any, event: Event) => {
					map[event.id] = module.id
					return map
				}, map)
				return map
			}, {})
	}

	getUniqueGrades(course: Course) {
		// @ts-ignore
		return _.uniq(_.flatten((course.audiences || []).map((audience: Audience) => audience.grades))).sort()
	}

	getModuleByModuleId(course: Course, moduleId: String) {
		return course.modules.find((module: Module) => module.id == moduleId)
	}

	async sortAudiences(audiences: Audience[]) {
		// sorts into order: [audiences with >0 departments], [audiences with >0 areas of work], [audiences with >0 interests], then alphabetically ascending order

		let sortFunction = (audience1: Audience, audience2: Audience) => {
			return audience1.name > audience2.name ? 1 : -1
		}
		let audiencesWithDepartments: Audience[] = []
		let audiencesWithAreasOfWork: Audience[] = []
		let audiencesWithInterests: Audience[] = []
		let audiencesWithNone: Audience[] = []

		for (let audience of audiences) {
			if (Array.isArray(audience.departments) && audience.departments.length) {
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

		let sortedAudiences: Audience[] = []
		sortedAudiences.push(...audiencesWithDepartments, ...audiencesWithAreasOfWork, ...audiencesWithInterests, ...audiencesWithNone)

		return sortedAudiences
	}

	async getRequiredLearning(departmentCodes: string[]) {
		return await this.learningCatalogue.getRequiredLearning(departmentCodes)
	}
}
