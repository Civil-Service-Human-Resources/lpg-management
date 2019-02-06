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

		const orgManager: Identity = new Identity('id1', [Identity.ORGANISATION_MANAGER], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(orgManager.isOrganisationManager()).to.be.true
		expect(learner.isOrganisationManager()).to.be.false
	})

	it('isOrganisationManagerOrSuperUser() should return true if identity has organisation_manager roles', () => {
		const accessToken: string = 'access-token'

		const orgManager: Identity = new Identity('id1', [Identity.ORGANISATION_MANAGER], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(orgManager.isOrganisationManagerOrSuperUser()).to.be.true
		expect(learner.isOrganisationManagerOrSuperUser()).to.be.false
	})

	it('isLearningManager() should return true if identity has learning manager roles', () => {
		const accessToken: string = 'access-token'

		const learningManager: Identity = new Identity('id1', [Identity.LEARNING_MANAGER], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(learningManager.isLearningManager()).to.be.true
		expect(learner.isLearningManager()).to.be.false
	})

	it('isCslAuthor() should return true if identity has csl author roles', () => {
		const accessToken: string = 'access-token'

		const cslAuthor: Identity = new Identity('id1', [Identity.CSL_AUTHOR], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(cslAuthor.isCslAuthor()).to.be.true
		expect(learner.isCslAuthor()).to.be.false
	})

	it('isOrganisationAuthorOrSuperUser() should return true if identity has organisation author roles', () => {
		const accessToken: string = 'access-token'

		const organisationAuthor: Identity = new Identity('id1', [Identity.ORGANISATION_AUTHOR], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(organisationAuthor.isOrganisationAuthorOrSuperUser()).to.be.true
		expect(learner.isOrganisationAuthorOrSuperUser()).to.be.false
	})

	it('isOrganisationAuthor() should return true if identity has organisation author roles', () => {
		const accessToken: string = 'access-token'

		const organisationAuthor: Identity = new Identity('id1', [Identity.ORGANISATION_AUTHOR], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(organisationAuthor.isOrganisationAuthor()).to.be.true
		expect(learner.isOrganisationAuthor()).to.be.false
	})

	it('isProfessionAuthorOrSuperUser() should return true if identity has profession author roles', () => {
		const accessToken: string = 'access-token'

		const professionAuthor: Identity = new Identity('id1', [Identity.PROFESSION_AUTHOR], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(professionAuthor.isProfessionAuthorOrSuperUser()).to.be.true
		expect(learner.isProfessionAuthorOrSuperUser()).to.be.false
	})

	it('isProfessionAuthor() should return true if identity has profession author roles', () => {
		const accessToken: string = 'access-token'

		const organisationAuthor: Identity = new Identity('id1', [Identity.PROFESSION_AUTHOR], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(organisationAuthor.isProfessionAuthor()).to.be.true
		expect(learner.isProfessionAuthor()).to.be.false
	})

	it('hasLearningCreate() should return true if identity has learning create roles', () => {
		const accessToken: string = 'access-token'

		const learningCreate: Identity = new Identity('id1', [Identity.LEARNING_CREATE], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(learningCreate.hasLearningCreate()).to.be.true
		expect(learner.hasLearningCreate()).to.be.false
	})

	it('hasLearningEdit() should return true if identity has learning edit roles', () => {
		const accessToken: string = 'access-token'

		const learningEdit: Identity = new Identity('id1', [Identity.LEARNING_EDIT], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(learningEdit.hasLearningEdit()).to.be.true
		expect(learner.hasLearningEdit()).to.be.false
	})

	it('hasLearningDelete() should return true if identity has learning delete roles', () => {
		const accessToken: string = 'access-token'

		const learningDelete: Identity = new Identity('id1', [Identity.LEARNING_DELETE], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(learningDelete.hasLearningDelete()).to.be.true
		expect(learner.hasLearningDelete()).to.be.false
	})

	it('hasLearningDelete() should return true if identity has learning publish roles', () => {
		const accessToken: string = 'access-token'

		const learningPublish: Identity = new Identity('id1', [Identity.LEARNING_PUBLISH], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(learningPublish.hasLearningPublish()).to.be.true
		expect(learner.hasLearningPublish()).to.be.false
	})

	it('hasLearningDelete() should return true if identity has learning delete roles', () => {
		const accessToken: string = 'access-token'

		const learningArchive: Identity = new Identity('id1', [Identity.LEARNING_ARCHIVE], accessToken)
		const learner: Identity = new Identity('id2', [Identity.LEARNER], accessToken)

		expect(learningArchive.hasLearningArchive()).to.be.true
		expect(learner.hasLearningArchive()).to.be.false
	})
})
