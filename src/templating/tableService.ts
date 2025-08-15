import {CourseBreakdown} from '../report-service/model/chart'
import {Table} from '../report-service/model/course-completions/table'

export class TableService {

	private collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

	convertBreakdownToNumericTable(breakdown: CourseBreakdown[]) {
		let breakdownTables: Table[] = []
		breakdown.forEach(breakdown => {
			const table = new Table(breakdown.title, [
				...this.convertDataToNumericTable(breakdown.rows),
				...this.convertDataToNumericTable(new Map<string, number>([["Total", breakdown.total]]))
			])
			breakdownTables.push(table)
		})
		return breakdownTables
	}

	convertDataToNumericTable(data: Map<string, number>, orderByText: boolean = false): {text: string, format?: string}[][] {
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
