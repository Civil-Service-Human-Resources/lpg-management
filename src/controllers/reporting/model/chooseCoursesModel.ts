import {Exclude, Transform} from 'class-transformer'
import {ArrayMaxSize, IsNotEmpty, ValidateIf} from 'class-validator'
import {REPORTING} from '../../../config'

export class ChooseCoursesModel {

	// settings
	@Exclude()
	public maxCoursesSelection: number = REPORTING.COURSE_COMPLETIONS_MAX_COURSES

	// data
	@Exclude()
	public userDepartment: string;
	@Exclude()
	public requiredLearningList: BasicCourse[]
	@Exclude()
	public courseSearchList: BasicCourse[]

	// input attributes
	public learning: string
	@ValidateIf(o => o.learning === "requiredLearning")
	@IsNotEmpty({
		message: 'reporting.course_completions.validation.requiredLearningSelection',
	})
	@ArrayMaxSize(REPORTING.COURSE_COMPLETIONS_MAX_COURSES, {
		message: 'reporting.course_completions.validation.maximumCourses',
	})
	@Transform(({value}) => {
		if (typeof value === "string") {
			return [value]
		} else {
			return [...value]
		}
	})
	public requiredLearning: string[]
	public allRequiredLearning: string

	@ValidateIf(o => o.learning === "courseSearch")
	@IsNotEmpty({
		message: 'reporting.course_completions.validation.courseSearchSelection',
	})
	@ArrayMaxSize(REPORTING.COURSE_COMPLETIONS_MAX_COURSES, {
		message: 'reporting.course_completions.validation.maximumCourses',
	})
	@Transform(({value}) => {
		if (typeof value === "string") {
			return [value]
		} else {
			return [...value]
		}
	})
	public courseSearch: string[]

	constructor(userDepartment: string, requiredLearningList: BasicCourse[] = [], courseSearchList: BasicCourse[] = []) {
		this.userDepartment = userDepartment
		this.requiredLearningList = requiredLearningList
		this.allRequiredLearning = requiredLearningList.map(c => c.value).join(",")
		this.courseSearchList = courseSearchList
	}

	getCourseIdsFromSelection(): string[] {
		if (this.learning === "requiredLearning") {
			if (this.requiredLearning.length === 1 && this.requiredLearning[0] === "all") {
				return this.allRequiredLearning.split(",")
			}
			return this.requiredLearning
		} else {
			return this.courseSearch
		}
	}

}

export class BasicCourse {
	constructor(public value: string, public text: string) {}
}
