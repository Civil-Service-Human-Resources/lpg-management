import {RestServiceConfig} from '../lib/http/restServiceConfig'

export class ReportServiceConfig implements RestServiceConfig {
	private _url: string
	private _timeout: number

	constructor(url: string, timeout: number) {
		this._url = url
		this._timeout = timeout
	}

	get url(): string {
		return this._url
	}

	get timeout(): number {
		return this._timeout
	}

}
