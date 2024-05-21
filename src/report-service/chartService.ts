import {ChartjsConfig} from './model/chartjsConfig'
import {DataPoint, PageModelDataPoint} from './model/dataPoint'
import {Dayjs} from 'dayjs'
import {Increment} from './model/incremement'
import {XAxisSettings} from './model/xAxisSettings'
import {ConfigSettings} from './model/configSettings'
import {TablePageModel} from '../controllers/reporting/model/tablePageModel'
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Europe/London')

export class ChartService {

	getTimezonedDayJs(...obj: any[]) {
		return dayjs(...obj).tz()
	}

	buildTableFromChartData(chartJSConfig: ChartjsConfig, caption: string, countColumnHeader: string): TablePageModel {
		return new TablePageModel(
			caption, [{text: chartJSConfig.xAxisSettings.tableHeader}, {text: countColumnHeader}],
			chartJSConfig.noJSChart.map(dp => [{text: dp.x}, {text: dp.y.toString()}])
		)
	}

	buildLabels(startDate: Dayjs, endDate: Dayjs, increment: Increment) {
		let nextLabel = startDate.set('hour', 0).set('minute', 0).set('second', 0)
		let labels = [nextLabel.valueOf()]
		while (nextLabel.isBefore(endDate)) {
			nextLabel = nextLabel.add(increment.amount, increment.unit)
			labels.push(nextLabel.valueOf())
		}
		return labels
	}

	getConfigurationSettings(startDate: Dayjs, endDate: Dayjs) {
		const dayDiff = endDate.diff(startDate, 'day')
		let increment
		let xAxisSettings
		if (dayDiff <= 1) {
			endDate = this.getTimezonedDayJs().set('minute', 0).set('second', 0)
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
			const timeZone = splitDateTz[1]
				.replaceAll("[", "")
				.replaceAll("]", "")
			return [this.getTimezonedDayJs(splitDateTz[0], timeZone).valueOf(), dataPoint.y]
		}))
	}

	mapLabelsToDataPoints(labels: number[], tableData: Map<number, number>) {
		return labels.slice(0, labels.length-1)
			.map(l => {
				let x = l
				let y = 0
				const tableDataPoint = tableData.get(l)
				if (tableDataPoint !== undefined) {
					y = tableDataPoint
				}
				return new PageModelDataPoint(x, y)
			})
	}

	buildChart(rawStartDate: string, rawEndDate: string, rawData: DataPoint[]): ChartjsConfig {
		const startDate = this.getTimezonedDayJs(rawStartDate)
		const endDate = this.getTimezonedDayJs(rawEndDate)
		const config = this.getConfigurationSettings(startDate, endDate)
		const labels = this.buildLabels(config.startDate, config.endDate, config.increment)
		const tableData = this.convertRawDataToTable(rawData)
		const dataPoints = this.mapLabelsToDataPoints(labels, tableData)
		const noJSData = dataPoints.map(dp => {
			const label = this.getTimezonedDayJs(dp.x).format(config.xAxisSettings.tooltipFormat)
			return new DataPoint(label, dp.y)
		})
		return new ChartjsConfig(labels, config.xAxisSettings, dataPoints, noJSData)
	}

}
