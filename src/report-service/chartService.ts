import {ChartjsConfig} from './model/chartjsConfig'
import {DataPoint} from './model/dataPoint'

export class ChartService {

	buildChart(startDate: string, endDate: string, rawData: DataPoint[]): ChartjsConfig {
		return new ChartjsConfig(startDate, endDate, rawData)
	}

}
