import Chart from 'chart.js/auto'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'

const charts = document.getElementsByClassName('chart-container')

for (const chart of charts) {
	const chartOptionsTag = chart.querySelector("[data-chart='settings']");
	const chartCanvasTag = chart.querySelector("[data-chart='canvas']");
	if (chartOptionsTag != null && chartCanvasTag != null) {
		console.log("Building chart")
		const options = JSON.parse(chartOptionsTag.innerHTML)
		console.log(options)
		options.data = options.data.map(dataPoint => {
			return {
				y: Number(dataPoint.y),
				x: Number(dataPoint.x)
			}
		})
		var c = new Chart(
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
							borderWidth: 1
						}
					]
				},
				responsive: true,
				maintainAspectRatio: false,
				options: {
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
		console.log(c)
	}
}
