import {Dayjs} from 'dayjs'

export class TimePeriodParameters {
	constructor(public startDate: Dayjs, public endDate: Dayjs, public timezone: string) { }
}
