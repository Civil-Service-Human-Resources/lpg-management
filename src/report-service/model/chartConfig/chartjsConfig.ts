import {XAxisSettings} from './xAxisSettings'
import {DataPoint} from '../dataPoint'

export class ChartjsConfig {
	constructor(public xAxisSettings: XAxisSettings,
				public data: DataPoint[], public noJSChart: Map<string, number>) {
	}
}
