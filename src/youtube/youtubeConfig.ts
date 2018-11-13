export class YoutubeConfig {
	private _timeout: number
	private _url: string

	constructor(timeout: number = 15000) {
		this._timeout = timeout
		this._url = ''
	}

	get timeout(): number {
		return this._timeout
	}

	set timeout(value: number) {
		this._timeout = value
	}

	get url(): string {
		return this._url
	}
}
