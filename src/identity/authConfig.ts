export class AuthConfig {
	private _clientId: string
	private _clientSecret: string
	private _authenticationServiceUrl: string
	private _callbackUrl: string
	private _authenticationPath: string
	private _authorizationPath: string
	private _authTokenPath: string

	constructor(
		clientId: string,
		clientSecret: string,
		authenticationServiceUrl: string,
		callbackUrl: string,
		authenticationPath: string,
		authorizationPath: string,
		authTokenPath: string
	) {
		this._clientId = clientId
		this._clientSecret = clientSecret
		this._authenticationServiceUrl = authenticationServiceUrl
		this._callbackUrl = callbackUrl
		this._authenticationPath = authenticationPath
		this._authorizationPath = authorizationPath
		this._authTokenPath = authTokenPath
	}

	get clientId(): string {
		return this._clientId
	}

	set clientId(value: string) {
		this._clientId = value
	}

	get clientSecret(): string {
		return this._clientSecret
	}

	set clientSecret(value: string) {
		this._clientSecret = value
	}

	get authenticationServiceUrl(): string {
		return this._authenticationServiceUrl
	}

	set authenticationServiceUrl(value: string) {
		this._authenticationServiceUrl = value
	}

	get callbackUrl(): string {
		return this._callbackUrl
	}

	set callbackUrl(value: string) {
		this._callbackUrl = value
	}

	get authenticationPath(): string {
		return this._authenticationPath
	}

	set authenticationPath(value: string) {
		this._authenticationPath = value
	}

	get authorizationPath(): string {
		return this._authorizationPath
	}

	set authorizationPath(value: string) {
		this._authorizationPath = value
	}

	get authTokenPath(): string {
		return this._authTokenPath
	}

	set authTokenPath(value: string) {
		this._authTokenPath = value
	}
}
