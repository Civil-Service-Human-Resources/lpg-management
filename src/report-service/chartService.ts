import {ChartjsConfig} from './model/chartjsConfig'
import {DataPoint} from './model/dataPoint'
import {Dayjs} from 'dayjs'
import {Increment} from './model/increment'
import {XAxisSettings} from './model/xAxisSettings'
import {ConfigSettings} from './model/configSettings'
import {getFrontendDayJs} from '../utils/dateUtil'

export class ChartService {

	buildGraphDataPoints(startDate: Dayjs, endDate: Dayjs, increment: Increment,
						 rawData: Map<string, number>): DataPoint[] {
		const format = increment.isDate() ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm:ss"
		let nextLabel = startDate.startOf('day')
		let dataPoints: DataPoint[] = []
		while (!nextLabel.isAfter(endDate)) {
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
			increment = new Increment(1, 'month')
			xAxisSettings = new XAxisSettings("Month", "MMMM YYYY", "month")
		}
		return new ConfigSettings(
			startDate, endDate, increment, xAxisSettings
		)
	}

	buildChart(startDate: Dayjs, endDate: Dayjs, rawData: Map<string, number>): ChartjsConfig {
		const config = this.getConfigurationSettings(startDate, endDate)
		const dataPoints = this.buildGraphDataPoints(config.startDate, config.endDate, config.increment, rawData)
		console.log(JSON.stringify(dataPoints))
		const dayJsDataPoints = dataPoints.map(dataPont => {
			console.log((getFrontendDayJs(dataPont.x) as any))
			return {
				x: (getFrontendDayJs(dataPont.x) as any),
				y: dataPont.y
			}
		})
		const noJSData = dayJsDataPoints.map(dp => {
			const label = dp.x.format(config.xAxisSettings.tooltipFormat)
			return new DataPoint(label, dp.y)
		})
		const conf =  new ChartjsConfig(dataPoints.map(dp => dp.x), config.xAxisSettings,
			dataPoints, noJSData)
		console.log(JSON.stringify(conf))
		return conf
	}

}
