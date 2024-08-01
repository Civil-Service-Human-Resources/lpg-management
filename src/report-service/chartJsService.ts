import {ChartjsConfig} from './model/chartConfig/chartjsConfig'
import dayjs = require('dayjs')
import {DataPoint} from './model/dataPoint'
import {ChartJsXaxisService} from './model/chartConfig/ChartJsXaxisService'

export class ChartJsService {

	constructor(private chartJsXaxisService: ChartJsXaxisService) { }

	buildChart(chartData: Map<string, number>, delimiter: string): ChartjsConfig {
		const xAxisSettings = this.chartJsXaxisService.getSetting(delimiter)
		const dataPoints: DataPoint[] = []
		const noJSData: Map<string, number> = new Map<string, number>()
		chartData.forEach((value, key) => {
			dataPoints.push(new DataPoint(key, value))
			noJSData.set(dayjs(key).format(xAxisSettings.tooltipFormat), value)
		})
		return new ChartjsConfig(xAxisSettings, dataPoints, noJSData)
	}

}
