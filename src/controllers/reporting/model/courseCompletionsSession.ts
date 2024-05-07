export class CourseCompletionsSession {
	constructor(public organisationIds?: number[], public courseIds?: string[]) { }

	hasSelectedOrganisations() {
		return this.organisationIds !== undefined && this.organisationIds.length > 0
	}

	hasSelectedCourses() {
		return this.courseIds !== undefined && this.courseIds.length > 0
	}
}
