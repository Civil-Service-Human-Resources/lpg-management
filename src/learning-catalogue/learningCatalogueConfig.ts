export class LearningCatalogueConfig {
	get timeout(): number {
		return this._timeout
	}

	set timeout(value: number) {
		this._timeout = value
	}
	private _auth: {
		username: string
		password: string
	}
	private _url: string
	private _timeout: number

	constructor(
		auth: {username: string; password: string},
		url: string,
		timeout: number = 15000
	) {
		this._auth = auth
		this._url = url
		this._timeout = timeout
	}

	get auth(): {username: string; password: string} {
		return this._auth
	}

	set auth(value: {username: string; password: string}) {
		this._auth = value
	}

	get url(): string {
		return this._url
	}

	set url(value: string) {
		this._url = value
	}
}
