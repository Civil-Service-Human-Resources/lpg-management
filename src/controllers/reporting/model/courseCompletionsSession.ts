import {DashboardTimePeriod, TODAY} from './dashboardTimePeriod'
import {CourseCompletionsFilterModel} from './courseCompletionsFilterModel'

export class CourseCompletionsSession {

	public timePeriod: DashboardTimePeriod = TODAY

	constructor(public userEmail: string, public fullName: string, public userUid: string, public selectedOrganisation?: {name: string, id: string},
				public allOrganisationIds?: number[], public courses?: {name: string, id: string}[],
				public chartData?: {text: string}[][]) { }

	static create(userDetails: any) {
		return new CourseCompletionsSession(userDetails.username, userDetails.fullName, userDetails.uid)
	}

	hasSelectedOrganisations() {
		return this.selectedOrganisation !== undefined &&
			this.allOrganisationIds !== undefined &&
			this.allOrganisationIds.length > 0
	}

	hasSelectedCourses() {
		return this.courses !== undefined && this.courses.length > 0
	}

	getCourseIds() {
		return (this.courses || []).map(course => course.id)
	}

	updateWithFilterPageModel(model: CourseCompletionsFilterModel) {
		this.timePeriod = model.getTimePeriod()
	}
}
