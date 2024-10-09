import {DashboardTimePeriod, TODAY, validValues} from './dashboardTimePeriod'
import {IsIn} from 'class-validator'

export class CourseCompletionsFilterModel {

	@IsIn(validValues.map(v => v.formValue))
	public timePeriod: string = "today"

	public remove: string

	public getTimePeriod(): DashboardTimePeriod {
		return validValues.find(value => value.formValue === this.timePeriod) || TODAY
	}
}
