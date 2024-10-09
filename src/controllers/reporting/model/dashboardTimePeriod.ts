export enum DashboardTimePeriodEnum {
	TODAY,
	PAST_SEVEN_DAYS,
	PAST_MONTH,
	PAST_YEAR
}

export class DashboardTimePeriod {
	constructor(public text: string, public formValue: string, public type: DashboardTimePeriodEnum) {
	}
}

export const TODAY = new DashboardTimePeriod("Today", "today", DashboardTimePeriodEnum.TODAY)
export const PAST_SEVEN_DAYS = new DashboardTimePeriod("Past seven days", "past-seven-days", DashboardTimePeriodEnum.PAST_SEVEN_DAYS)
export const PAST_MONTH = new DashboardTimePeriod("Past month", "past-month", DashboardTimePeriodEnum.PAST_MONTH)
export const PAST_YEAR = new DashboardTimePeriod("Past year", "past-year", DashboardTimePeriodEnum.PAST_YEAR)

export const validValues = [TODAY, PAST_SEVEN_DAYS, PAST_MONTH, PAST_YEAR]
