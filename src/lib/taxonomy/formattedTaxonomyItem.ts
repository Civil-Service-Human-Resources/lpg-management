export class FormattedTaxonomyItem {
	public id: number
	public name: string
	public code: string

	constructor(id: number, name: string, code: string) {
		this.id = id
		this.name = name
		this.code = code
	}

	getName() {
		const parts = this.name.split("|")
		return parts[parts.length - 1].trim()
	}
}