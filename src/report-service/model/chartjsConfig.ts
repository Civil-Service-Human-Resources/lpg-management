import {ChartJsXAxisSettings} from './chartJsXAxisSettings'
import {DataPoint, NumericDataPoint} from './dataPoint'
// import {Dayjs} from 'dayjs'

export class ChartjsConfig {
	constructor(public data: NumericDataPoint[], public labels: number[],
				public xAxisSettings: ChartJsXAxisSettings) {
	}
}

export class MinimalChartJsConfig {
	constructor(public startDate: string, public endDate: string, public data: DataPoint[]) {
	}
}
