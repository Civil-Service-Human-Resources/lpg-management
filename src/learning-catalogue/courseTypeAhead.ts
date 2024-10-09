import {Type} from 'class-transformer'
import {Course} from './model/course'

export class BasicCourse {
	constructor(public id: string, public name: string) {}
}

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
			if (c.id === course.id) {
				c.name = course.title
			}
			return c
		})
		this.sort()
	}

	removeCourse(id: string) {
		this.typeahead = this.typeahead.filter(c => c.id != id)
	}

	sort() {
		const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
		this.typeahead.sort((a, b) => { return collator.compare(a.name!, b.name!)})
	}
}
