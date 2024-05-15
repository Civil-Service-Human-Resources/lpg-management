import {ChartJsXAxisSettings} from './chartJsXAxisSettings'
import {NumberedDataPoint} from './dataPoint'

export class ChartjsConfig {
	constructor(public data: NumberedDataPoint[], public labels: number[],
				public xAxisSettings: ChartJsXAxisSettings) {
	}
}
