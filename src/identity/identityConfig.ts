export class IdentityConfig {
    get timeout(): number {
        return this._timeout
    }

    set timeout(value: number) {
        this._timeout = value
    }
    private _url: string
    private _timeout: number

    constructor(url: string, timeout: number = 30000) {
        this._url = url
        this._timeout = timeout
    }

    get url(): string {
        return this._url
    }

    set url(value: string) {
        this._url = value
    }
}
