import {CourseCompletionAggregationChart} from '../../../report-service/model/courseCompletionAggregationChart'

export class CourseCompletionsGraphModel {
	public chart: CourseCompletionAggregationChart

	constructor(chart: CourseCompletionAggregationChart) {
		this.chart = chart
	}
}
