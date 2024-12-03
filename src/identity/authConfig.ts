export class AuthConfig {

	constructor(
		public clientId: string,
		public clientSecret: string,
		public authenticationServiceUrl: string,
		public callbackUrl: string,
		public authenticationPath: string,
		public authorizationPath: string,
		public authTokenPath: string,
		public logoutUrl: string
	) { }

	getLogoutEndpoint() {
		return `${this.authenticationServiceUrl}${this.logoutUrl}`
	}
}
