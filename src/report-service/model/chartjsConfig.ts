import {ChartJsXAxisSettings} from './chartJsXAxisSettings'
import {NumericDataPoint} from './dataPoint'

export class ChartjsConfig {
	constructor(public data: NumericDataPoint[], public labels: number[],
				public xAxisSettings: ChartJsXAxisSettings) {
	}
}
