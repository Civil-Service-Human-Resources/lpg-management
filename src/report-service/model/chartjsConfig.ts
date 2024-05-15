import {ChartJsXAxisSettings} from './chartJsXAxisSettings'
import {DataPoint} from './dataPoint'

export class ChartjsConfig {
	constructor(public data: DataPoint[], public labels: number[],
				public xAxisSettings: ChartJsXAxisSettings) {
	}
}
