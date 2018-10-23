export class YoutubeConfig {
	private _timeout: number

	constructor(timeout: number = 15000) {
		this._timeout = timeout
	}

	get timeout(): number {
		return this._timeout
	}

	set timeout(value: number) {
		this._timeout = value
	}
}
