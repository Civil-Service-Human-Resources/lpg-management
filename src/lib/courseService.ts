import {LearningCatalogue} from '../learning-catalogue'
import {Course} from '../learning-catalogue/model/course'
import {Module} from '../learning-catalogue/model/module'

export class CourseService {
	learningCatalogue: LearningCatalogue

	constructor(learningCatalogue: LearningCatalogue) {
		this.learningCatalogue = learningCatalogue
	}

	public async sortModules(accessToken: string, courseId: string, moduleIds: string[]): Promise<Course> {
		const course: Course = await this.learningCatalogue.getCourse(courseId, accessToken)

		if (course.modules.length !== moduleIds.length) {
			throw new Error(
				`Course modules length(${course.modules.length}) does not match module ids length(${moduleIds.length})`
			)
		}

		let modules: Module[] = []

		moduleIds.forEach(id => {
			const module: Module | undefined = course.modules.find(m => {
				return m.id === id
			})

			if (module) {
				modules.push(module)
			} else {
				throw new Error(`Module (id: ${id}) not found in course (id: ${courseId})`)
			}
		})

		course.modules = modules

		return await this.learningCatalogue.updateCourse(course, accessToken)
	}
}
