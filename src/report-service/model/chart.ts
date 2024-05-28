import {DataPoint} from './dataPoint'
import {Type} from 'class-transformer'

export class Chart {
	@Type(() => DataPoint)
	public chart: DataPoint[];
	@Type(() => Map)
	public courseBreakdown: Map<string, number>;
	public total: number;

	constructor(chart: DataPoint[], courseBreakdown: Map<string, number>, total: number) {
		this.chart = chart
		this.courseBreakdown = courseBreakdown
		this.total = total
	}

}
