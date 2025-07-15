import {Exclude, Transform} from 'class-transformer'
import {ArrayMaxSize, IsNotEmpty, ValidateIf} from 'class-validator'
import {REPORTING} from '../../../config'

export enum LearningSelection {
	requiredLearning = "requiredLearning",
	courseSearch = "courseSearch",
	allLearning = "allLearning"
}

export class ChooseCoursesModel {

	// settings
	@Exclude()
	public maxCoursesSelection: number = REPORTING.COURSE_COMPLETIONS_MAX_COURSES
	@Exclude()
	public showRequiredLearningOption: boolean = false

	// data
	@Exclude()
	public userDepartment?: string[];
	@Exclude()
	public requiredLearningList: BasicCoursePageModel[]
	@Exclude()
	public courseSearchList: BasicCoursePageModel[]

	// input attributes
	public learning: LearningSelection
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

	constructor(userDepartment?: string[], requiredLearningList: BasicCoursePageModel[] = [],
				courseSearchList: BasicCoursePageModel[] = []) {
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
		} else if (this.learning === "courseSearch") {
			return this.courseSearch
		} else {
			return []
		}
	}

}

export class BasicCoursePageModel {
	constructor(public value: string, public text: string) {}
}
