import { OrganisationalUnit } from "src/csrs/model/organisationalUnit"

export enum Role {
	LEARNER = 'LEARNER',
	ORGANISATION_MANAGER = 'ORGANISATION_MANAGER',
	CSL_AUTHOR = 'CSL_AUTHOR',
	LEARNING_MANAGER = 'LEARNING_MANAGER',
	LEARNING_CREATE = 'LEARNING_CREATE',
	LEARNING_EDIT = 'LEARNING_EDIT',
	LEARNING_DELETE = 'LEARNING_DELETE',
	ORGANISATION_AUTHOR = 'ORGANISATION_AUTHOR',
	PROFESSION_AUTHOR = 'PROFESSION_AUTHOR',
	LEARNING_PUBLISH = 'LEARNING_PUBLISH',
	LEARNING_ARCHIVE = 'LEARNING_ARCHIVE',
	KPMG_SUPPLIER_AUTHOR = 'KPMG_SUPPLIER_AUTHOR',
	KORNFERRY_SUPPLIER_AUTHOR = 'KORNFERRY_SUPPLIER_AUTHOR',
	KNOWLEDGEPOOL_SUPPLIER_AUTHOR = 'KNOWLEDGEPOOL_SUPPLIER_AUTHOR',
	LEARNING_PROVIDER_MANAGER = 'LEARNING_PROVIDER_MANAGER',
	SKILLS_MANAGER = 'SKILLS_MANAGER',
	CSHR_REPORTER = 'CSHR_REPORTER',
	DOWNLOAD_BOOKING_FEED = 'DOWNLOAD_BOOKING_FEED',
	IDENTITY_DELETE = 'IDENTITY_DELETE',
	IDENTITY_MANAGER = 'IDENTITY_MANAGER',
	KORNFERRY_SUPPLIER_REPORTER = 'KORNFERRY_SUPPLIER_REPORTER',
	KPMG_SUPPLIER_REPORTER = 'KPMG_SUPPLIER_REPORTER',
	MANAGE_CALL_OFF_PO = 'MANAGE_CALL_OFF_PO',
	ORGANISATION_REPORTER = 'ORGANISATION_REPORTER',
	PROFESSION_MANAGER = 'PROFESSION_MANAGER',
	PROFESSION_REPORTER = 'PROFESSION_REPORTER',
	MVP_REPORTER = 'MVP_REPORTER',
	SUPER_REPORTER = 'SUPER_REPORTER'
}

export class Identity {

	readonly uid: string
	readonly username: string
	readonly roles: string[]
	readonly accessToken: string
	readonly organisationalUnit: OrganisationalUnit
	
	constructor(uid: string, username: string, roles: string[], accessToken: string, organisationalUnit: OrganisationalUnit | undefined = undefined) {
		this.uid = uid
		this.username = username
		this.roles = roles
		this.accessToken = accessToken
		this.organisationalUnit
	}

	hasRole(role: string) {
		return this.roles && this.roles.indexOf(role) > -1
	}

	hasAnyRole(roles: string[]) {
		return this.roles && this.roles.some(value => roles.indexOf(value) > -1)
	}

	hasAnyAdminRole() {
		// i.e. isn't just a LEARNER who navigated to the admin app by modifying the URL
		return this.hasAnyRole([
			Role.CSHR_REPORTER,
			Role.CSL_AUTHOR,
			Role.DOWNLOAD_BOOKING_FEED,
			Role.IDENTITY_DELETE,
			Role.IDENTITY_MANAGER,
			Role.KNOWLEDGEPOOL_SUPPLIER_AUTHOR,
			Role.KORNFERRY_SUPPLIER_AUTHOR,
			Role.KORNFERRY_SUPPLIER_REPORTER,
			Role.KPMG_SUPPLIER_AUTHOR,
			Role.KPMG_SUPPLIER_REPORTER,
			Role.LEARNING_ARCHIVE,
			Role.LEARNING_CREATE,
			Role.LEARNING_DELETE,
			Role.LEARNING_EDIT,
			Role.LEARNING_MANAGER,
			Role.LEARNING_PUBLISH,
			Role.MANAGE_CALL_OFF_PO,
			Role.ORGANISATION_AUTHOR,
			Role.ORGANISATION_MANAGER,
			Role.ORGANISATION_REPORTER,
			Role.PROFESSION_AUTHOR,
			Role.PROFESSION_MANAGER,
			Role.PROFESSION_REPORTER
		])
	}

	isMVPReporter() {
		return this.hasRole(Role.MVP_REPORTER) && (this.isOrganisationReporter() || this.isCshrReporter())
	}

	hasEventViewingRole() {
		// coarse-grained check for general permission to view events
		return this.hasAnyRole([Role.CSL_AUTHOR, Role.LEARNING_MANAGER]) || this.isSupplierAuthor()
	}

	isOrganisationManager() {
		return this.hasRole(Role.ORGANISATION_MANAGER)
	}

	isOrganisationManagerOrSuperUser() {
		return this.hasRole(Role.ORGANISATION_MANAGER) || this.isSuperUser()
	}

	isLearningManager() {
		return this.hasRole(Role.LEARNING_MANAGER)
	}

	isCslAuthor() {
		return this.hasRole(Role.CSL_AUTHOR)
	}

	isSuperUser() {
		return this.isCslAuthor() || this.isLearningManager()
	}

	isOrganisationAuthorOrSuperUser() {
		return this.hasRole(Role.ORGANISATION_AUTHOR) || this.isSuperUser()
	}

	isOrganisationAuthor() {
		return this.hasRole(Role.ORGANISATION_AUTHOR)
	}

	isProfessionAuthorOrSuperUser() {
		return this.hasRole(Role.PROFESSION_AUTHOR) || this.isSuperUser()
	}

	isProfessionAuthor() {
		return this.hasRole(Role.PROFESSION_AUTHOR)
	}

	isSupplierAuthor() {
		return this.hasRole(Role.KPMG_SUPPLIER_AUTHOR) || this.hasRole(Role.KNOWLEDGEPOOL_SUPPLIER_AUTHOR) || this.hasRole(Role.KORNFERRY_SUPPLIER_AUTHOR)
	}

	isLearningProviderManager() {
		return this.hasRole(Role.LEARNING_PROVIDER_MANAGER)
	}

	hasLearningCreate() {
		return this.hasRole(Role.LEARNING_CREATE) || this.isSuperUser()
	}

	hasLearningEdit() {
		return this.hasRole(Role.LEARNING_EDIT) || this.isSuperUser()
	}

	hasLearningDelete() {
		return this.hasRole(Role.LEARNING_DELETE) || this.isSuperUser()
	}

	hasLearningPublish() {
		return this.hasRole(Role.LEARNING_PUBLISH) || this.isSuperUser()
	}

	hasLearningArchive() {
		return this.hasRole(Role.LEARNING_ARCHIVE) || this.isSuperUser()
	}

	isReporter() {
		return this.isCshrReporter() || this.isProfessionReporter() ||
			this.isOrganisationReporter() || this.isKPMGSupplierReporter() ||
			this.isKornferrySupplierReporter();
	}

	isLearner() {
		return this.hasRole(Role.LEARNER)
	}

	isCshrReporter() {
		return this.hasRole('CSHR_REPORTER')
	}

	isProfessionReporter() {
		return this.hasRole('PROFESSION_REPORTER')
	}

	isOrganisationReporter() {
		return this.hasRole(Role.ORGANISATION_REPORTER)
	}

	isKPMGSupplierReporter() {
		return this.hasRole('KPMG_SUPPLIER_REPORTER')
	}

	isKornferrySupplierReporter() {
		return this.hasRole('KORNFERRY_SUPPLIER_REPORTER')
	}

	isSkillsManagerOrSuperUser() {
		return this.hasRole(Role.SKILLS_MANAGER) || this.isSuperUser() || this.isCshrReporter() || this.isOrganisationReporter() || this.isProfessionReporter()
	}

	isSuperReporter(){
		return this.hasRole(Role.SUPER_REPORTER)
	}
}
