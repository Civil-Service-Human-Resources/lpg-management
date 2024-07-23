import {DataPoint} from './dataPoint'
import {Type} from 'class-transformer'

export class Chart {
	public timezone: string
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

	public getChartDataAsMap(delimiter: string) {
		const map = new Map<string, number>()
		this.chart.forEach(dataPoint => {
			const key = delimiter !== 'HOUR' ? dataPoint.x.split("T")[0] : dataPoint.x
			map.set(key, dataPoint.y)
		})
		return map
	}

}
