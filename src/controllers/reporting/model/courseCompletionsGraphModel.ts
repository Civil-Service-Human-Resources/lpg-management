import { MinimalChartJsConfig} from '../../../report-service/model/chartjsConfig'

// export class CourseCompletionsGraphModel {
// 	constructor(public chart: ChartjsConfig) {
// 		this.chart = chart
// 	}
// }

export class CourseCompletionsGraphModel {
	constructor(public chart: MinimalChartJsConfig) {
		this.chart = chart
	}
}
