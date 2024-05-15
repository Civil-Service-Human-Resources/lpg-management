import Chart from 'chart.js/auto'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'

const charts = document.getElementsByClassName('chart-container')

for (const chart of charts) {
	const chartOptionsTag = chart.querySelector("[data-chart='settings']");
	const chartCanvasTag = chart.querySelector("[data-chart='canvas']");
	if (chartOptionsTag != null && chartCanvasTag != null) {
		const options = JSON.parse(chartOptionsTag.innerHTML)
		let chart = new Chart(
			chartCanvasTag,
			{
				type: 'line',
				data: {
					labels: options.labels,
					datasets: [
						{
							label: '# of courses completed',
							data: options.data,
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
								unit: options.xAxisSettings.unit,
								tooltipFormat: options.xAxisSettings.tooltipFormat
							},
							ticks: {
								source: 'labels'
							}
						},
					},

				}
			}
		)

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
