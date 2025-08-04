import {BasicCoursePageModel} from '../../controllers/reporting/model/chooseCoursesModel'

export class OrgRequiredLearningMap {
	public departmentMap: Map<number, {id: string, title: string}[]>

	getAllCourses() {
		const requiredLearningSet: Set<BasicCoursePageModel> = new Set()
		this.departmentMap.forEach((departments) => {
			departments.forEach(c => {
				requiredLearningSet.add(new BasicCoursePageModel(c.id, c.title))
			})
		})
		const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
		return [...requiredLearningSet].sort((a, b) => { return collator.compare(a.text, b.text!)})
	}
}
