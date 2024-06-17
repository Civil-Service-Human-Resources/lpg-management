export class CourseCompletionsSession {
	constructor(public selectedOrganisationId?: number, public allOrganisationIds?: number[], public courses?: {name: string, id: string}[], public chartData?: {text: string}[][]) { }

	hasSelectedOrganisations() {
		return this.selectedOrganisationId !== undefined &&
			this.allOrganisationIds !== undefined &&
			this.allOrganisationIds.length > 0
	}

	hasSelectedCourses() {
		return this.courses !== undefined && this.courses.length > 0
	}

	getCourseIds() {
		return (this.courses || []).map(course => course.id)
	}
}
