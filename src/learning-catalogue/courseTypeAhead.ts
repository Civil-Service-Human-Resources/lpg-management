import {Type} from 'class-transformer'
import {BasicCourse} from '../controllers/reporting/model/chooseCoursesModel'
import {Course} from './model/course'

export class CourseTypeAhead {
	@Type(() => BasicCourse)
	public typeahead: BasicCourse[]

	constructor(typeahead: BasicCourse[]) {
		this.typeahead = typeahead
	}

	static createAndSort(typeahead: BasicCourse[]) {
		const typeaheadObject = new CourseTypeAhead(typeahead)
		typeaheadObject.sort()
		return typeaheadObject
	}

	addCourse(course: Course) {
		this.typeahead.push(new BasicCourse(course.id, course.title))
		this.sort()
	}

	updateCourse(course: Course) {
		this.typeahead = this.typeahead.map(c => {
			if (c.value === course.id) {
				c.text = course.title
			}
			return c
		})
		this.sort()
	}

	removeCourse(id: string) {
		this.typeahead = this.typeahead.filter(c => c.value != id)
	}

	sort() {
		const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
		this.typeahead.sort((a, b) => { return collator.compare(a.text!, b.text!)})
	}
}
