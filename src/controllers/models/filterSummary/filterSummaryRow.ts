import {FilterSummaryTag} from './filterSummaryTag'

export class FilterSummaryRow {
	constructor(public summaryText: string, public tags: FilterSummaryTag[], public submitUrl: string,
				public changeLink?: string, public changeText?: string) {
	}

}
