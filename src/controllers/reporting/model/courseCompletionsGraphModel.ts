import { ChartjsConfig} from '../../../report-service/model/chartjsConfig'

export class CourseCompletionsGraphModel {
	constructor(public chart: ChartjsConfig) {
		this.chart = chart
	}
}
