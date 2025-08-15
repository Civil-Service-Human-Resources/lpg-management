export class Table {
	constructor(public title: string, public rows: {text: string, format?: string | undefined}[][]) {
	}
}
