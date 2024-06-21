import {Dayjs} from 'dayjs'
import {Increment} from './increment'
import {XAxisSettings} from './xAxisSettings'

export class ConfigSettings {
	constructor(public startDate: Dayjs, public endDate: Dayjs, public inclusive: boolean,
				public increment: Increment, public xAxisSettings: XAxisSettings) { }
}
