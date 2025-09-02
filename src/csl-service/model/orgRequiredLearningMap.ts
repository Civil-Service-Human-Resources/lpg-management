import {BasicCoursePageModel} from '../../controllers/reporting/model/chooseCoursesModel'
import {CourseWithTitle} from './courseWithTitle'

export class OrgRequiredLearningMap {
	public departmentMap: {[key: number]: CourseWithTitle[]}

	public getAllCourses() {
		const _ids: string[] = []
		const requiredLearning: BasicCoursePageModel[] = []
		for (const _id of Object.keys(this.departmentMap)) {
			const departments = this.departmentMap[parseInt(_id)]
			departments.forEach(c => {
				if (!_ids.includes(c.id)) {
					requiredLearning.push(new BasicCoursePageModel(c.id, c.title))
					_ids.push(c.id)
				}
			})
		}
		const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
		return requiredLearning.sort((a, b) => { return collator.compare(a.text, b.text!)})
	}
}
