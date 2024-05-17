import Chart from 'chart.js/auto'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import {Dayjs, ManipulateType} from 'dayjs'
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

function buildLabels(startDate, endDate, labelIncrement, labelIncrementUnit) {
	let nextLabel = startDate.set('hour', 0).set('minute', 0).set('second', 0)
	let labels = [nextLabel.valueOf()]
	while (nextLabel.isBefore(endDate)) {
		nextLabel = nextLabel.add(labelIncrement, labelIncrementUnit)
		labels.push(nextLabel.valueOf())
	}
	return labels
}

function buildChartConfig(startDate, endDate, rawData) {
	console.log(startDate)
	const dayDiff = startDate.diff(endDate, 'day')
	let xAxisTooltipFormat
	let xAxisUnit
	let labels
	if (dayDiff <= 1) {
		endDate = dayjs().set('minute', 0).set('second', 0)
		labels = buildLabels(startDate, endDate, 1, 'hour')
		xAxisTooltipFormat = "ha"
		xAxisUnit = "hour"
	} else if (dayDiff <= 7) {
		labels = buildLabels(startDate, endDate, 1, 'day')
		xAxisTooltipFormat = "eeee d MMMM"
		xAxisUnit = "day"
	} else if (dayDiff <= 30) {
		labels = buildLabels(startDate, endDate, 3, 'hour')
		xAxisTooltipFormat = "d MMMM yyyy"
		xAxisUnit = "day"
	} else {
		labels = buildLabels(startDate, endDate, 1, 'month')
		xAxisTooltipFormat = "d MMMM yyyy"
		xAxisUnit = "month"
	}
	console.log(rawData)
	const tableData = new Map(rawData.map(dataPoint => {
		const splitDateTz = dataPoint.x.split("Z")
		const timeZone = splitDateTz[1]
			.replaceAll("[", "")
			.replaceAll("]", "")
		return [dayjs.tz(splitDateTz[0], timeZone).valueOf(), dataPoint.y]
	}))
	const data = labels.slice(0, labels.length-1)
		.map(l => {
		let x = l
		let y = 0
		const tableDataPoint = tableData.get(l)
		if (tableDataPoint !== undefined) {
			y = tableDataPoint
		}
		return {x, y}
	})
	return {
		data,
		labels,
		xAxisUnit,
		xAxisTooltipFormat
	}
}

const charts = document.getElementsByClassName('chart-container')

for (const chart of charts) {
	const chartOptionsTag = chart.querySelector("[data-chart='settings']");
	const chartCanvasTag = chart.querySelector("[data-chart='canvas']");
	if (chartOptionsTag != null && chartCanvasTag != null) {
		const options = JSON.parse(chartOptionsTag.innerHTML)
		console.log(options)
		console.log(dayjs(options.startDate))
		const config = buildChartConfig(dayjs(options.startDate), dayjs(options.endDate), options.data)
		console.log(config.labels)
		let chart = new Chart(
			chartCanvasTag,
			{
				type: 'line',
				data: {
					labels: config.labels,
					datasets: [
						{
							label: '# of courses completed',
							data: config.data,
							borderColor: "#1d70b8",
							backgroundColor: "#1d70b8",
							borderWidth: 1,
							spanGaps: true
						}
					]
				},
				responsive: true,
				maintainAspectRatio: true,
				options: {
					hover: {
						mode: 'nearest', // show tooltip for the nearest data point
						intersect: false // do not require the mouse to intersect the data point
					},
					tooltips: {
						mode: 'nearest', // show tooltip for the nearest data point
						intersect: false, // do not require the mouse to intersect the data point
						callbacks: {
							label: function(tooltipItem, data) {
								return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel + '%'; // customize tooltip label
							}
						}
					},
					focus: {
						mode: 'nearest', // enable keyboard navigation for the nearest data point
						intersect: false // do not require the keyboard to intersect the data point
					},
					scales: {
						y: {
							beginAtZero: true,
							ticks: {
								precision: 0
							}
						},
						x: {
							type: 'time',
							time: {
								unit: config.xAxisUnit,
								tooltipFormat: config.xAxisTooltipFormat
							},
							ticks: {
								source: 'labels'
							}
						},
					},

				}
			}
		)

		// let chart = new Chart(
		// 	chartCanvasTag,
		// 	{
		// 		type: 'line',
		// 		data: {
		// 			labels: options.labels,
		// 			datasets: [
		// 				{
		// 					label: '# of courses completed',
		// 					data: options.data,
		// 					borderColor: "#1d70b8",
		// 					backgroundColor: "#1d70b8",
		// 					borderWidth: 1,
		// 					spanGaps: true
		// 				}
		// 			]
		// 		},
		// 		responsive: true,
		// 		maintainAspectRatio: true,
		// 		options: {
		// 			hover: {
		// 				mode: 'nearest', // show tooltip for the nearest data point
		// 				intersect: false // do not require the mouse to intersect the data point
		// 			},
		// 			tooltips: {
		// 				mode: 'nearest', // show tooltip for the nearest data point
		// 				intersect: false, // do not require the mouse to intersect the data point
		// 				callbacks: {
		// 					label: function(tooltipItem, data) {
		// 						return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel + '%'; // customize tooltip label
		// 					}
		// 				}
		// 			},
		// 			focus: {
		// 				mode: 'nearest', // enable keyboard navigation for the nearest data point
		// 				intersect: false // do not require the keyboard to intersect the data point
		// 			},
		// 			scales: {
		// 				y: {
		// 					beginAtZero: true,
		// 					ticks: {
		// 						precision: 0
		// 					}
		// 				},
		// 				x: {
		// 					type: 'time',
		// 					time: {
		// 						unit: options.xAxisSettings.unit,
		// 						tooltipFormat: options.xAxisSettings.tooltipFormat
		// 					},
		// 					ticks: {
		// 						source: 'labels'
		// 					}
		// 				},
		// 			},
		//
		// 		}
		// 	}
		// )

		console.log('Adding event listener')
		chartCanvasTag.addEventListener("keydown", (e) => {
			let currentlyActiveIndex
			let currentlyActivePlotPoint = chart.getActiveElements()[0]

			if(currentlyActivePlotPoint === undefined){
				currentlyActiveIndex = 0
			} else {
				currentlyActiveIndex = currentlyActivePlotPoint.index

				if(e.key === "ArrowLeft"){
					currentlyActiveIndex--

					if(currentlyActiveIndex < 0){
						currentlyActiveIndex = 0
					}
				}
				else if(e.key === "ArrowRight"){
					currentlyActiveIndex++

					if(currentlyActiveIndex > chart.data.datasets[0].data.length-1){
						currentlyActiveIndex = chart.data.datasets[0].data.length-1
					}

				}
			}

			chart.setActiveElements([{ datasetIndex: 0, index: currentlyActiveIndex }])
			chart.tooltip.setActiveElements([{ datasetIndex: 0, index: currentlyActiveIndex }])
			chart.update()
		})
	}
}
