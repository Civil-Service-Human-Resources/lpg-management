import {DashboardTimePeriodType} from './dashboardTimePeriod'
import {CourseCompletionsGraphModel} from './courseCompletionsGraphModel'
import {LearningSelection} from './chooseCoursesModel'
import {FormattedOrganisation} from '../../../csl-service/model/FormattedOrganisation'
import {OrganisationSelection} from './chooseOrganisationsModel'
import {Type} from 'class-transformer'

export class CourseCompletionsSession {

	public timePeriod: DashboardTimePeriodType = 'today'
	public startDay?: string
	public startMonth?: string
	public startYear?: string
	public endDay?: string
	public endMonth?: string
	public endYear?: string

	@Type(() => FormattedOrganisation)
	public selectedOrganisations?: FormattedOrganisation[]

	constructor(public userEmail: string,
		public fullName: string,
		public userUid: string,
		public organisationFormSelection?: OrganisationSelection | number,
		selectedOrganisations?: FormattedOrganisation[],
		public learningSelection?: LearningSelection,
		public courses?: {name: string, id: string}[],
		public chartData?: {text: string}[][]) {
		this.selectedOrganisations = selectedOrganisations
	}

	static create(userDetails: any) {
		return new CourseCompletionsSession(userDetails.username, userDetails.fullName, userDetails.uid)
	}

	hasSelectedOrganisations() {
		const allOrganisationsSelected = this.organisationFormSelection === "allOrganisations"
		const specificOrganisationIdsSelected = this.selectedOrganisations !== undefined &&
			this.selectedOrganisations.length > 0

		return allOrganisationsSelected || specificOrganisationIdsSelected
	}

	hasSelectedCourses() {
		if (this.learningSelection) {
			if (this.learningSelection === "allLearning") {
				return true
			} else {
				return this.courses !== undefined && this.courses.length > 0
			}
		}
		return false
	}

	getCourseIds() {
		return (this.courses || []).map(course => course.id)
	}

	updateWithFilterPageModel(model: CourseCompletionsGraphModel) {
		this.timePeriod = model.timePeriod
		const customDateRange = model.timePeriod === 'custom'
		this.startDay = customDateRange ? model.startDay : undefined
		this.startMonth = customDateRange ? model.startMonth : undefined
		this.startYear = customDateRange ? model.startYear : undefined
		this.endDay = customDateRange ? model.endDay : undefined
		this.endMonth = customDateRange ? model.endMonth : undefined
		this.endYear = customDateRange ? model.endYear : undefined
	}
}
