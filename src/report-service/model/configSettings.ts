import {Dayjs} from 'dayjs'
import {Increment} from './increment'
import {XAxisSettings} from './xAxisSettings'

export class ConfigSettings {
	constructor(public startDate: Dayjs, public endDate: Dayjs,
				public increment: Increment, public xAxisSettings: XAxisSettings) {
		this.startDate = startDate
		this.endDate = endDate
		this.increment = increment
		this.xAxisSettings = xAxisSettings
	}
}
