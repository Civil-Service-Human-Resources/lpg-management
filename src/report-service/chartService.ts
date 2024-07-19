import {ChartjsConfig} from './model/chartjsConfig'
import {DataPoint, PageModelDataPoint} from './model/dataPoint'
import {Dayjs} from 'dayjs'
import {Increment} from './model/increment'
import {XAxisSettings} from './model/xAxisSettings'
import {ConfigSettings} from './model/configSettings'
import {getDayJsRawValue, getFrontendDayJs} from '../utils/dateUtil'

export class ChartService {

	buildLabels(startDate: Dayjs, endDate: Dayjs, increment: Increment) {
		const format = increment.isDate() ? "YYYY-MM-DD" : "YYYY-MM-DDTHH:mm:ss"
		let nextLabel = startDate.startOf('day')
		let labels = [nextLabel.format(format)]
		while (nextLabel.isBefore(endDate)) {
			nextLabel = nextLabel.add(increment.amount, increment.unit)
			labels.push( nextLabel.format(format))
		}
		if (['hour', 'month'].includes(increment.unit)) {
			labels.pop()
		}
		return labels
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

	mapLabelsToDataPoints(labels: string[], dataPoints: DataPoint[]) {
		const tableData = new Map(dataPoints.map(dataPoint => {
			return [dataPoint.x, dataPoint.y]
		}))
		return labels
			.map(l => {
				let x = l
				let y = 0
				const tableDataPoint = tableData.get(l)
				if (tableDataPoint !== undefined) {
					y = tableDataPoint
				}
				return new DataPoint(x, y)
			})
	}

	buildChart(startDate: Dayjs, endDate: Dayjs, rawData: DataPoint[]): ChartjsConfig {
		const config = this.getConfigurationSettings(startDate, endDate)
		const labels = this.buildLabels(config.startDate, config.endDate, config.increment)
		const dataPoints = this.mapLabelsToDataPoints(labels, rawData)
		const noJSData = dataPoints.map(dp => {
			const label = getFrontendDayJs(dp.x).format(config.xAxisSettings.tooltipFormat)
			return new DataPoint(label, dp.y)
		})
		return new ChartjsConfig(labels.map(l => getDayJsRawValue(l)), config.xAxisSettings,
			dataPoints.map(dataPoint => new PageModelDataPoint(getDayJsRawValue(dataPoint.x), dataPoint.y)), noJSData)
	}

}
