import {ChartjsConfig} from './model/chartjsConfig'
import {DataPoint, PageModelDataPoint} from './model/dataPoint'
import {Dayjs, ManipulateType} from 'dayjs'
import {Increment} from './model/increment'
import {XAxisSettings} from './model/xAxisSettings'
import {ConfigSettings} from './model/configSettings'
import {getFrontendDayJs} from '../utils/dateUtil'
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

var advancedFormat = require("dayjs/plugin/advancedFormat");

dayjs.extend(advancedFormat);
dayjs.extend(utc)
dayjs.extend(timezone)

export class ChartService {

	buildLabels(startDate: Dayjs, endDate: Dayjs, increment: Increment) {
		let nextLabel = startDate.startOf('day')
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
			endDate = dayjs().set('minute', 0).set('second', 0)
			increment = new Increment(1, 'hour')
			xAxisSettings = new XAxisSettings("Time", "hA", "hour")
		} else if (dayDiff <= 8) {
			endDate = endDate.startOf('day')
			increment = new Increment(1, 'day')
			xAxisSettings = new XAxisSettings("Date", "dddd Do MMMM", "day")
		} else if (dayDiff <= 30) {
			increment = new Increment(1, 'week')
			xAxisSettings = new XAxisSettings("Week commencing", "[Week commencing] Do MMMM YYYY", "week")
		} else {
			increment = new Increment(1, 'month')
			xAxisSettings = new XAxisSettings("Month", "MMMM yyyy", "month")
		}
		return new ConfigSettings(
			startDate, endDate, increment, xAxisSettings
		)
	}

	convertRawDataToTable(rawData: DataPoint[], unit: ManipulateType) {
		return new Map(rawData.map(dataPoint => {
			let dayObject = dayjs(dataPoint.x)
			if (unit !== 'hour') {
				dayObject = dayObject.startOf('day')
			}
			return [dayObject.valueOf(), dataPoint.y]
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
				return new PageModelDataPoint(x, y)
			})
	}

	buildChart(startDate: Dayjs, endDate: Dayjs, rawData: DataPoint[]): ChartjsConfig {
		const config = this.getConfigurationSettings(startDate, endDate)
		const labels = this.buildLabels(config.startDate, config.endDate, config.increment)
		const tableData = this.convertRawDataToTable(rawData, config.increment.unit)
		const dataPoints = this.mapLabelsToDataPoints(labels, tableData)
		const noJSData = dataPoints.map(dp => {
			const label = getFrontendDayJs(dp.x).format(config.xAxisSettings.tooltipFormat)
			return new DataPoint(label, dp.y)
		})
		return new ChartjsConfig(labels, config.xAxisSettings, dataPoints, noJSData)
	}

}
