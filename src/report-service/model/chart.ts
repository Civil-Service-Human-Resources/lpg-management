import {Type} from 'class-transformer'

export class Chart {
	public timezone: string
	@Type(() => Map)
	public chart: Map<string, number>;
	@Type(() => Map)
	public courseBreakdown: Map<string, number>;
	public total: number;
	public delimiter: string;
	public hasRequest: boolean;

	constructor(chart: Map<string, number>, courseBreakdown: Map<string, number>, total: number) {
		this.chart = chart
		this.courseBreakdown = courseBreakdown
		this.total = total
	}

}
