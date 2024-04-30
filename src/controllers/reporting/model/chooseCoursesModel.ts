import {Transform} from 'class-transformer'
import {IsNotEmpty, ValidateIf} from 'class-validator'

export class ChooseCoursesModel {
	public userDepartment: string;
	public requiredLearningList: BasicCourse[]

	// input attributes
	public learning: string
	@ValidateIf(o => o.learning === "requiredLearning")
	@IsNotEmpty({
		message: 'reporting.course_completions.validation.requiredLearningSelection',
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

	constructor(userDepartment: string, requiredLearningList: BasicCourse[] = []) {
		this.userDepartment = userDepartment
		this.requiredLearningList = requiredLearningList
		this.allRequiredLearning = requiredLearningList.map(c => c.value).join(",")
	}

	getCourseIdsFromSelection(): string[] {
		if (this.learning === "requiredLearning") {
			if (this.requiredLearning.length === 1 && this.requiredLearning[0] === "all") {
				return this.allRequiredLearning.split(",")
			}
			return this.requiredLearning
		}
		return []
	}

}

export class BasicCourse {
	constructor(public value: string, public text: string) {}
}
