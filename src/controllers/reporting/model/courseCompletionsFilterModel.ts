import {DateStartEndCommand} from '../../command/dateStartEndCommand'
import {DashboardTimePeriodType} from './dashboardTimePeriod'
import {ValidateIf} from 'class-validator'

const validateIfCustom = (o: any) => {
	return o.timePeriod === 'custom'
}

export class CourseCompletionsFilterModel extends DateStartEndCommand {

	constructor(timePeriod: DashboardTimePeriodType, startDay?: string, startMonth?: string,
				startYear?: string, endDay?: string, endMonth?: string, endYear?: string,
				errors?: {fields: any, size: any}) {
		super(startDay, startMonth, startYear, endDay, endMonth, endYear, errors)
		this.timePeriod = timePeriod
	}

	public timePeriod: DashboardTimePeriodType = 'today'

	public getErrorMsg(startEnd: 'start' | 'end'): string | undefined {
		const errors = this.errors
		if (errors) {
			for (const error of Object.keys(errors.fields)) {
				if (error.includes(startEnd)) {
					return errors.fields[error][0]
				}
			}
		}
	}

	@ValidateIf(validateIfCustom)
	startDate?: string
	@ValidateIf(validateIfCustom)
	endDate?: string

	@ValidateIf(validateIfCustom)
	startDay?: string

	@ValidateIf(validateIfCustom)
	startMonth?: string

	@ValidateIf(validateIfCustom)
	startYear?: string

	@ValidateIf(validateIfCustom)
	endDay?: string

	@ValidateIf(validateIfCustom)
	endMonth?: string

	@ValidateIf(validateIfCustom)
	endYear?: string

	public remove: string

}
