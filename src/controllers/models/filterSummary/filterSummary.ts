import {FilterSummaryRow} from './filterSummaryRow'

export class FilterSummary {
	constructor(public rows: FilterSummaryRow[], public submitUrl?: string) {
	}

}
