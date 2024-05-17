var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

export class RawConfig {
	constructor(startDate, endDate, rawData) {
		this.startDate = startDate
		this.endDate = endDate
		this.rawData = rawData
	}
}

export class Increment {
	constructor(amount, unit) {
		this.amount = amount
		this.unit = unit
	}
}

export class XAxisSettings {
	constructor(tooltipFormat, unit) {
		this.tooltipFormat = tooltipFormat
		this.unit = unit
	}
}

export class ConfigSettings {
	constructor(startDate, endDate, increment, xAxisSettings) {
		this.startDate = startDate
		this.endDate = endDate
		this.increment = increment
		this.xAxisSettings = xAxisSettings
	}
}

export function formatRawConfig(rawConfigJSON) {
	return new RawConfig(dayjs(rawConfigJSON['startDate']),
		dayjs(rawConfigJSON['endDate']), rawConfigJSON['data'])
}

export function buildLabels(startDate, endDate, increment) {
	let nextLabel = startDate.set('hour', 0).set('minute', 0).set('second', 0)
	let labels = [nextLabel.valueOf()]
	while (nextLabel.isBefore(endDate)) {
		nextLabel = nextLabel.add(increment.amount, increment.unit)
		labels.push(nextLabel.valueOf())
	}
	return labels
}

export function getConfigurationSettings(startDate, endDate) {
	const dayDiff = endDate.diff(startDate, 'day')
	let increment
	let xAxisSettings
	if (dayDiff <= 1) {
		endDate = dayjs().set('minute', 0).set('second', 0)
		increment = new Increment(1, 'hour')
		xAxisSettings = new XAxisSettings("ha", "hour")
	} else if (dayDiff <= 7) {
		increment = new Increment(1, 'day')
		xAxisSettings = new XAxisSettings("eeee d MMMM", "day")
	} else if (dayDiff <= 30) {
		increment = new Increment(3, 'day')
		xAxisSettings = new XAxisSettings("d MMMM yyyy", "day")
	} else {
		increment = new Increment(1, 'month')
		xAxisSettings = new XAxisSettings("d MMMM yyyy", "month")
	}
	return new ConfigSettings(
		startDate, endDate, increment, xAxisSettings
	)
}

export function convertRawDataToTable(rawData) {
	return new Map(rawData.map(dataPoint => {
		const splitDateTz = dataPoint.x.split("Z")
		const timeZone = splitDateTz[1]
			.replaceAll("[", "")
			.replaceAll("]", "")
		return [dayjs.tz(splitDateTz[0], timeZone).valueOf(), dataPoint.y]
	}))
}

export function mapLabelsToDataTable(labels, tableData) {
	return labels.slice(0, labels.length-1)
		.map(l => {
			let x = l
			let y = 0
			const tableDataPoint = tableData.get(l)
			if (tableDataPoint !== undefined) {
				y = tableDataPoint
			}
			return {x, y}
		})
}
