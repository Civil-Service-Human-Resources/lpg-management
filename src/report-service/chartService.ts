import {ChartjsConfig} from './model/chartjsConfig'
import {ChartJsXAxisSettings} from './model/chartJsXAxisSettings'
import {Dayjs, ManipulateType} from 'dayjs'
import {DataPoint, NumericDataPoint} from './model/dataPoint'
import dayjs = require('dayjs')
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export class ChartService {

	buildLabels(startDate: Dayjs, endDate: Dayjs,
				labelIncrement: number, labelIncrementUnit: ManipulateType) {
		let nextLabel = startDate.set('minute', 0).set('second', 0)
		let labels: number[] = [nextLabel.valueOf()]
		while (nextLabel.isBefore(endDate)) {
			nextLabel = nextLabel.add(labelIncrement, labelIncrementUnit)
			labels.push(nextLabel.valueOf())
		}
		return labels
	}

	buildChart(startDate: Dayjs, endDate: Dayjs, rawData: DataPoint[]): ChartjsConfig {
		const dayDiff = startDate.diff(endDate, 'day')
		let xAxisSettings
		let labels: number[]
		if (dayDiff <= 1) {
			labels = this.buildLabels(startDate, endDate, 1, 'hour')
			xAxisSettings = new ChartJsXAxisSettings("hour", "ha")
		} else if (dayDiff <= 7) {
			labels = this.buildLabels(startDate, endDate, 1, 'day')
			xAxisSettings = new ChartJsXAxisSettings("day", "eeee d MMMM")
		} else if (dayDiff <= 30) {
			labels = this.buildLabels(startDate, endDate, 3, 'hour')
			xAxisSettings = new ChartJsXAxisSettings("day", "d MMMM yyyy")
		} else {
			labels = this.buildLabels(startDate, endDate, 1, 'month')
			xAxisSettings = new ChartJsXAxisSettings("month", "d MMMM yyyy")
		}
		console.log(rawData)
		const tableData: Map<number, number> = new Map(rawData.map(dataPoint => {
			const splitDateTz = dataPoint.x.split("Z")
			const timeZone = splitDateTz[1]
				.replaceAll("[", "")
				.replaceAll("]", "")
			return [dayjs.tz(splitDateTz[0], timeZone).valueOf(), dataPoint.y]
		}))
		const convertedData = labels.map(l => {
			let x = l
			let y = 0
			const tableDataPoint = tableData.get(l)
			if (tableDataPoint !== undefined) {
				y = tableDataPoint
			}
			return new NumericDataPoint(x, y)
		})
		return new ChartjsConfig(convertedData, labels, xAxisSettings)
	}

}
