import {DataPoint} from './dataPoint'
import {Type} from 'class-transformer'

export class CourseCompletionAggregationChart {
	@Type(() => DataPoint)
	public data: DataPoint[];

	constructor(data: DataPoint[]) {
		this.data = data
	}
}
