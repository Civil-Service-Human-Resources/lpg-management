const chartJs = require('chartjs')

let data =

let chart = new Chart(
	document.getElementById('course-completions-chart'),
	{
		type: 'line',
		data: {
			labels: data.map(row => row.month),
			datasets: [
				{
					label: 'Completed modules',
					data: data.map(row => row.completedModules),
					borderColor: "#1d70b8",
					backgroundColor: "#1d70b8"
				}
			]
		}
	}
)
