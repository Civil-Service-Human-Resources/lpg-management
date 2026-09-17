export class Hyperlink {
	id: number
	title: string
	description: string
	href: string
	get url(): string {
		return this.href
	}
	set url(value: string) {
		this.href = value
	}
}
