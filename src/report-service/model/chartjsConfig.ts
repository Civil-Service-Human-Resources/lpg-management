import {DataPoint} from './dataPoint'

export class ChartjsConfig {
	constructor(public startDate: string, public endDate: string, public data: DataPoint[]) {
	}
}
