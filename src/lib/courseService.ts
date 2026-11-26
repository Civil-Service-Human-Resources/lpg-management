import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {Module} from '../learning-catalogue/model/module'

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
		await this.learningCatalogue.updateModuleOrder(course.id, modules)

		return course
	}

}
