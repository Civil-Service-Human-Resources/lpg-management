export class DashboardTimePeriod {
	constructor(public text: string, public formValue: string) {
	}
}

export const TODAY = new DashboardTimePeriod("Today", "today")
export const PAST_SEVEN_DAYS = new DashboardTimePeriod("Past seven days", "past-seven-days")
export const PAST_MONTH = new DashboardTimePeriod("Past month", "past-month")
export const PAST_YEAR = new DashboardTimePeriod("Past year", "past-year")

export const validValues = [TODAY, PAST_SEVEN_DAYS, PAST_MONTH, PAST_YEAR]
