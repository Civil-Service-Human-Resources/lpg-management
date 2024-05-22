import {DataPoint} from './dataPoint'
import {Type} from 'class-transformer'

export class Chart {
	@Type(() => DataPoint)
	public chart: DataPoint[];

	constructor(chart: DataPoint[]) {
		this.chart = chart
	}

}
