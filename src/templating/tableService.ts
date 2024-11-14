export class TableService {

	private collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

	convertDataToNumericTable(data: Map<string, number>, orderByText: boolean = false) {
		let rows: {text: string, format?: string}[][] = []
		data.forEach((value, key) => {
			rows.push([{text: key}, {text: value.toLocaleString(), format: "numeric"}])
		})
		if (orderByText) {
			rows = rows.sort((a, b) => { return this.collator.compare(a[0].text, b[0].text)})
		}
		return rows
	}

}
