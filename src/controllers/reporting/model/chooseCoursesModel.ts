export class ChooseCoursesModel {
	public userDepartment: string;
	public requiredLearning: BasicCourse[]
	public selectedLearning: string
	public requiredLearningSelections: string[]

	constructor(userDepartment: string, requiredLearning: BasicCourse[]) {
		this.userDepartment = userDepartment
		this.requiredLearning = requiredLearning
	}

}

export class BasicCourse {
	constructor(public value: string, public text: string) {}
}
