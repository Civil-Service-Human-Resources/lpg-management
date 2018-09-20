export class CsrsConfig {
<<<<<<< HEAD
	get timeout(): number {
		return this._timeout
	}

	set timeout(value: number) {
		this._timeout = value
	}
	private _url: string
	private _timeout: number

	constructor(url: string, timeout: number = 15000) {
		this._url = url
		this._timeout = timeout
=======
	private _url: string

	constructor(url: string) {
		this._url = url
>>>>>>> origin
	}

	get url(): string {
		return this._url
	}

	set url(value: string) {
		this._url = value
	}
}
