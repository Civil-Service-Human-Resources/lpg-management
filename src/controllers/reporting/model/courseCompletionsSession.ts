export class CourseCompletionsSession {
	constructor(public selectedOrganisationId?: number, public allOrganisationIds?: number[], public courseIds?: string[]) { }

	hasSelectedOrganisations() {
		return this.selectedOrganisationId !== undefined &&
			this.allOrganisationIds !== undefined &&
			this.allOrganisationIds.length > 0
	}

	hasSelectedCourses() {
		return this.courseIds !== undefined && this.courseIds.length > 0
	}
}
