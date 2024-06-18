export class FilterSummaryTag {
	constructor(public tagText: string, public formName: string, public formValue: string, public preText?: string,
				public dismissable: boolean = false, public shouldSubmit: boolean = false) {
	}
}
