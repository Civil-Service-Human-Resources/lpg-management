import {DataPoint} from './dataPoint'
import {XAxisSettings} from './xAxisSettings'

export class ChartjsConfig {
	constructor(public labels: string[], public xAxisSettings: XAxisSettings,
				public data: DataPoint[], public noJSChart: DataPoint[]) {
	}
}
