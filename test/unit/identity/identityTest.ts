import {describe, it} from 'mocha'
import {expect} from 'chai'
import {Identity, Role} from '../../../src/identity/identity'
import { OrganisationalUnit } from 'src/csrs/model/organisationalUnit'

describe('Identity tests', () => {
	it('hasRoles() should return true if identity contains role', () => {
		const uid: string = 'user-_id'
		const username = 'user@domain.com'
		const roles: string[] = ['role1', 'role2']
		const accessToken: string = 'access-token'

		const identity: Identity = new Identity(uid, username, roles, accessToken, new OrganisationalUnit())

		expect(identity.hasRole('role1')).to.be.true
		expect(identity.hasRole('role2')).to.be.true
		expect(identity.hasRole('role3')).to.be.false
	})

	it('hasRoles() should return true if identity has any of the roles specified', () => {
		const uid: string = 'user-_id'
		const roles: string[] = ['role1', 'role2']
		const username = 'user@domain.com'
		const accessToken: string = 'access-token'

		const identity: Identity = new Identity(uid, username, roles, accessToken, new OrganisationalUnit())

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

		const orgManager: Identity = new Identity('id1', 'user@domain.com', [Role.ORGANISATION_MANAGER], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user2@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(orgManager.isOrganisationManager()).to.be.true
		expect(learner.isOrganisationManager()).to.be.false
	})

	it('isOrganisationManagerOrSuperUser() should return true if identity has organisation_manager roles', () => {
		const accessToken: string = 'access-token'

		const orgManager: Identity = new Identity('id1', 'user@domain.com', [Role.ORGANISATION_MANAGER], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user2@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(orgManager.isOrganisationManagerOrSuperUser()).to.be.true
		expect(learner.isOrganisationManagerOrSuperUser()).to.be.false
	})

	it('isLearningManager() should return true if identity has learning manager roles', () => {
		const accessToken: string = 'access-token'

		const learningManager: Identity = new Identity('id1', 'user@domain.com', [Role.LEARNING_MANAGER], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(learningManager.isLearningManager()).to.be.true
		expect(learner.isLearningManager()).to.be.false
	})

	it('isCslAuthor() should return true if identity has csl author roles', () => {
		const accessToken: string = 'access-token'

		const cslAuthor: Identity = new Identity('id1', 'user@domain.com', [Role.CSL_AUTHOR], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(cslAuthor.isCslAuthor()).to.be.true
		expect(learner.isCslAuthor()).to.be.false
	})

	it('isOrganisationAuthorOrSuperUser() should return true if identity has organisation author roles', () => {
		const accessToken: string = 'access-token'

		const organisationAuthor: Identity = new Identity('id1', 'user@domain.com', [Role.ORGANISATION_AUTHOR], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user2@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(organisationAuthor.isOrganisationAuthorOrSuperUser()).to.be.true
		expect(learner.isOrganisationAuthorOrSuperUser()).to.be.false
	})

	it('isOrganisationAuthor() should return true if identity has organisation author roles', () => {
		const accessToken: string = 'access-token'

		const organisationAuthor: Identity = new Identity('id1', 'user@domain.com', [Role.ORGANISATION_AUTHOR], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(organisationAuthor.isOrganisationAuthor()).to.be.true
		expect(learner.isOrganisationAuthor()).to.be.false
	})

	it('isProfessionAuthorOrSuperUser() should return true if identity has profession author roles', () => {
		const accessToken: string = 'access-token'

		const professionAuthor: Identity = new Identity('id1', 'user@domain.com', [Role.PROFESSION_AUTHOR], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(professionAuthor.isProfessionAuthorOrSuperUser()).to.be.true
		expect(learner.isProfessionAuthorOrSuperUser()).to.be.false
	})

	it('isProfessionAuthor() should return true if identity has profession author roles', () => {
		const accessToken: string = 'access-token'

		const organisationAuthor: Identity = new Identity('id1', 'user@domain.com', [Role.PROFESSION_AUTHOR], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(organisationAuthor.isProfessionAuthor()).to.be.true
		expect(learner.isProfessionAuthor()).to.be.false
	})

	it('hasLearningCreate() should return true if identity has learning create roles', () => {
		const accessToken: string = 'access-token'

		const learningCreate: Identity = new Identity('id1', 'user@domain.com', [Role.LEARNING_CREATE], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(learningCreate.hasLearningCreate()).to.be.true
		expect(learner.hasLearningCreate()).to.be.false
	})

	it('hasLearningEdit() should return true if identity has learning edit roles', () => {
		const accessToken: string = 'access-token'

		const learningEdit: Identity = new Identity('id1', 'user@domain.com', [Role.LEARNING_EDIT], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(learningEdit.hasLearningEdit()).to.be.true
		expect(learner.hasLearningEdit()).to.be.false
	})

	it('hasLearningDelete() should return true if identity has learning delete roles', () => {
		const accessToken: string = 'access-token'

		const learningDelete: Identity = new Identity('id1', 'user@domain.com', [Role.LEARNING_DELETE], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(learningDelete.hasLearningDelete()).to.be.true
		expect(learner.hasLearningDelete()).to.be.false
	})

	it('hasLearningDelete() should return true if identity has learning publish roles', () => {
		const accessToken: string = 'access-token'

		const learningPublish: Identity = new Identity('id1', 'user@domain.com', [Role.LEARNING_PUBLISH], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(learningPublish.hasLearningPublish()).to.be.true
		expect(learner.hasLearningPublish()).to.be.false
	})

	it('hasLearningDelete() should return true if identity has learning delete roles', () => {
		const accessToken: string = 'access-token'

		const learningArchive: Identity = new Identity('id1', 'user@domain.com', [Role.LEARNING_ARCHIVE], accessToken, new OrganisationalUnit())
		const learner: Identity = new Identity('id2', 'user@domain.com', [Role.LEARNER], accessToken, new OrganisationalUnit())

		expect(learningArchive.hasLearningArchive()).to.be.true
		expect(learner.hasLearningArchive()).to.be.false
	})
})
