import {Type} from 'class-transformer'

export class CourseBreakdown {
	public title: string
	@Type(() => Map)
	public rows: Map<string, number>
	public total: number
}

export class Chart {
	public timezone: string
	@Type(() => Map)
	public chart: Map<string, number>;
	@Type(() => CourseBreakdown)
	public breakdowns: CourseBreakdown[];
	public total: number;
	public delimiter: string;
	public hasRequest: boolean;

	constructor(chart: Map<string, number>, breakdowns: CourseBreakdown[], total: number) {
		this.chart = chart
		this.breakdowns = breakdowns
		this.total = total
	}

}
