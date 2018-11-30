export class Identity {
	readonly uid: string
	readonly roles: string[]
	readonly accessToken: string

	constructor(uid: string, roles: string[], accessToken: string) {
		this.uid = uid
		this.roles = roles
		this.accessToken = accessToken
	}

	hasRole(role: string) {
		return this.roles && this.roles.indexOf(role) > -1
	}

	hasAnyRole(roles: string[]) {
		return this.roles && this.roles.some(value => roles.indexOf(value) > -1)
	}

	isOrganisationManager() {
		return this.hasRole('ORGANISATION_MANAGER')
	}
}
