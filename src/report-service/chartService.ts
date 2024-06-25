import {ChartjsConfig} from './model/chartjsConfig'
import {DataPoint, PageModelDataPoint} from './model/dataPoint'
import {Dayjs} from 'dayjs'
import {Increment} from './model/increment'
import {XAxisSettings} from './model/xAxisSettings'
import {ConfigSettings} from './model/configSettings'
import {getFrontendDayJs, getServerDayJs} from '../utils/dateUtil'

export class ChartService {

	buildLabels(startDate: Dayjs, endDate: Dayjs, increment: Increment) {
		let nextLabel = startDate.set('hour', 0).set('minute', 0).set('second', 0)
		let labels = [nextLabel.valueOf()]
		while (nextLabel.isBefore(endDate)) {
			nextLabel = nextLabel.add(increment.amount, increment.unit)
			labels.push(nextLabel.valueOf())
		}
		labels.pop()
		return labels
	}

	getConfigurationSettings(startDate: Dayjs, endDate: Dayjs) {
		const dayDiff = endDate.diff(startDate, 'day')
		let increment
		let xAxisSettings
		if (dayDiff <= 1) {
			endDate = getServerDayJs().set('minute', 0).set('second', 0)
			increment = new Increment(1, 'hour')
			xAxisSettings = new XAxisSettings("Time", "hA", "hour")
		} else if (dayDiff <= 7) {
			increment = new Increment(1, 'day')
			xAxisSettings = new XAxisSettings("Date", "eeee d MMMM", "day")
		} else if (dayDiff <= 30) {
			increment = new Increment(1, 'week')
			xAxisSettings = new XAxisSettings("Week commencing", "d MMMM yyyy", "week")
		} else {
			increment = new Increment(1, 'month')
			xAxisSettings = new XAxisSettings("Month", "MMMM yyyy", "month")
		}
		return new ConfigSettings(
			startDate, endDate, increment, xAxisSettings
		)
	}

	convertRawDataToTable(rawData: DataPoint[]) {
		return new Map(rawData.map(dataPoint => {
			const splitDateTz = dataPoint.x.split("Z")
			return [getServerDayJs(splitDateTz[0]).valueOf(), dataPoint.y]
		}))
	}

	mapLabelsToDataPoints(labels: number[], tableData: Map<number, number>) {
		return labels
			.map(l => {
				let x = l
				let y = 0
				const tableDataPoint = tableData.get(l)
				if (tableDataPoint !== undefined) {
					y = tableDataPoint
				}
				return new PageModelDataPoint(getFrontendDayJs(x).valueOf(), y)
			})
	}

	buildChart(rawStartDate: string, rawEndDate: string, rawData: DataPoint[]): ChartjsConfig {
		const startDate = getFrontendDayJs(rawStartDate)
		const endDate = getFrontendDayJs(rawEndDate)
		const config = this.getConfigurationSettings(startDate, endDate)
		const labels = this.buildLabels(config.startDate, config.endDate, config.increment)
		const tableData = this.convertRawDataToTable(rawData)
		const dataPoints = this.mapLabelsToDataPoints(labels, tableData)
		const noJSData = dataPoints.map(dp => {
			const label = getFrontendDayJs(dp.x).format(config.xAxisSettings.tooltipFormat)
			return new DataPoint(label, dp.y)
		})
		return new ChartjsConfig(labels, config.xAxisSettings, dataPoints, noJSData)
	}

}
