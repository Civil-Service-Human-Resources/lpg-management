import {PageModelDataPoint} from './dataPoint'
import {XAxisSettings} from './xAxisSettings'

export class ChartjsConfig {
	constructor(public labels: number[], public xAxisSettings: XAxisSettings,
				public data: PageModelDataPoint[]) {
	}
}
