import {ChartjsConfig} from './model/chartjsConfig'
import {ChartJsXAxisSettings} from './model/chartJsXAxisSettings'
import {Dayjs, ManipulateType} from 'dayjs'
import {DataPoint, NumberedDataPoint} from './model/dataPoint'
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
		let labels
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
		const convertedData = rawData.map(dataPoint => {
			const splitDateTz = dataPoint.x.split("Z")
			const timeZone = splitDateTz[1]
				.replaceAll("[", "")
				.replaceAll("]", "")
			return new NumberedDataPoint(dayjs.tz(splitDateTz[0], timeZone).valueOf().toString(), dataPoint.y)
		})
		return new ChartjsConfig(convertedData, labels, xAxisSettings)
	}

}
