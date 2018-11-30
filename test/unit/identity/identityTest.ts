import {describe, it} from 'mocha'
import {expect} from 'chai'
import {Identity} from '../../../src/identity/identity'

describe('Identity tests', () => {
	it('hasRoles() should return true if identity contains role', () => {
		const uid: string = 'user-_id'
		const roles: string[] = ['role1', 'role2']
		const accessToken: string = 'access-token'

		const identity: Identity = new Identity(uid, roles, accessToken)

		expect(identity.hasRole('role1')).to.be.true
		expect(identity.hasRole('role2')).to.be.true
		expect(identity.hasRole('role3')).to.be.false
	})

	it('hasRoles() should return true if identity has any of the roles specified', () => {
		const uid: string = 'user-_id'
		const roles: string[] = ['role1', 'role2']
		const accessToken: string = 'access-token'

		const identity: Identity = new Identity(uid, roles, accessToken)

		expect(identity.hasAnyRole(['role1'])).to.be.true
		expect(identity.hasAnyRole(['role2'])).to.be.true
		expect(identity.hasAnyRole(['role1', 'role2'])).to.be.true
		expect(identity.hasAnyRole(['role1', 'role3'])).to.be.true
		expect(identity.hasAnyRole(['role2', 'role3'])).to.be.true
		expect(identity.hasAnyRole(['role3'])).to.be.false
		expect(identity.hasAnyRole(['role3', 'role4'])).to.be.false
	})

	it('isOrganisationManager() should return true if identity has organisation_manager roles', () => {
		const accessToken: string = 'access-token'

		const orgManager: Identity = new Identity('id1', ['ORGANISATION_MANAGER'], accessToken)
		const learner: Identity = new Identity('id2', ['LEARNER'], accessToken)

		expect(orgManager.isOrganisationManager()).to.be.true
		expect(learner.isOrganisationManager()).to.be.false
	})
})
