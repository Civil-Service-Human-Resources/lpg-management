export class FormattedTaxonomyItem {
	public id: number
	public name: string

	constructor(id: number, name: string) {
		this.id = id
		this.name = name
	}

	getName() {
		const parts = this.name.split("|")
		return parts[parts.length - 1].trim()
	}
}