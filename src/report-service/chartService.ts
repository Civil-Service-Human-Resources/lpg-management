import {ChartjsConfig} from './model/chartjsConfig'
import {DataPoint} from './model/dataPoint'
import {Dayjs} from 'dayjs'
import {Increment} from './model/increment'
import {XAxisSettings} from './model/xAxisSettings'
import {ConfigSettings} from './model/configSettings'
import {getFrontendDayJs} from '../utils/dateUtil'

export class ChartService {

	buildGraphDataPoints(config: ConfigSettings,
						 rawData: Map<string, number>): DataPoint[] {
		const increment = config.increment
		const format = increment.isDate() ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm:ss"
		let nextLabel = config.startDate.startOf('day')
		let dataPoints: DataPoint[] = []
		while (!nextLabel.isAfter(config.endDate)) {
			const label = nextLabel.format(format)
			const value = rawData.get(label) || 0
			dataPoints.push(new DataPoint(label, value))
			nextLabel = nextLabel.add(increment.amount, increment.unit)
		}
		return dataPoints
	}

	getConfigurationSettings(startDate: Dayjs, endDate: Dayjs) {
		const dayDiff = endDate.diff(startDate, 'day')
		let increment
		let xAxisSettings
		if (dayDiff <= 1) {
			endDate = getFrontendDayJs().set('minute', 0).set('second', 0)
			increment = new Increment(1, 'hour')
			xAxisSettings = new XAxisSettings("Time", "hA", "hour")
		} else if (dayDiff <= 31) {
			endDate = endDate.startOf('day')
			increment = new Increment(1, 'day')
			xAxisSettings = new XAxisSettings("Date", "dddd Do MMMM", "day")
		} else {
			endDate = endDate.startOf('day')
			increment = new Increment(1, 'month')
			xAxisSettings = new XAxisSettings("Month", "MMMM YYYY", "month")
		}
		return new ConfigSettings(
			startDate, endDate, increment, xAxisSettings
		)
	}

	buildChart(startDate: Dayjs, endDate: Dayjs, rawData: Map<string, number>): ChartjsConfig {
		const config = this.getConfigurationSettings(startDate, endDate)
		const dataPoints = this.buildGraphDataPoints(config, rawData)
		const noJSData = dataPoints.map(dp => {
			const label = getFrontendDayJs(dp.x).format(config.xAxisSettings.tooltipFormat)
			return new DataPoint(label, dp.y)
		})
		return new ChartjsConfig(dataPoints.map(dp => dp.x), config.xAxisSettings,
			dataPoints, noJSData)
	}

}
