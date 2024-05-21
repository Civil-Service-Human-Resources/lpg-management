export class TablePageModel {
	constructor(public caption: string, public headings: {text: string}[], public rows: {text: string}[][]) { }
}
