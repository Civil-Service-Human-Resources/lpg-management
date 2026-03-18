import { OrganisationalUnit } from "src/csrs/model/organisationalUnit"
import {Profile} from '../csrs/model/profile'

export enum Role {
	LEARNER = 'LEARNER',
	ORGANISATION_MANAGER = 'ORGANISATION_MANAGER',
	CSL_AUTHOR = 'CSL_AUTHOR',
	LEARNING_MANAGER = 'LEARNING_MANAGER',
	LEARNING_CREATE = 'LEARNING_CREATE',
	LEARNING_EDIT = 'LEARNING_EDIT',
	LEARNING_DELETE = 'LEARNING_DELETE',
	ORGANISATION_AUTHOR = 'ORGANISATION_AUTHOR',
	LEARNING_PUBLISH = 'LEARNING_PUBLISH',
	LEARNING_ARCHIVE = 'LEARNING_ARCHIVE',
	KPMG_SUPPLIER_AUTHOR = 'KPMG_SUPPLIER_AUTHOR',
	CSHR_REPORTER = 'CSHR_REPORTER',
	DOWNLOAD_BOOKING_FEED = 'DOWNLOAD_BOOKING_FEED',
	ORGANISATION_REPORTER = 'ORGANISATION_REPORTER',
	MVP_REPORTER = 'MVP_REPORTER',
	UNRESTRICTED_ORGANISATION = 'UNRESTRICTED_ORGANISATION',
	REPORT_EXPORT = 'REPORT_EXPORT',
	REPORTING_ALL_ORGANISATIONS = 'REPORTING_ALL_ORGANISATIONS',
	TIER1_REPORTING = 'TIER1_REPORTING',
	REGISTERED_LEARNER_REPORTER = 'REGISTERED_LEARNER_REPORTER',
	LEARNING_UNARCHIVE = 'LEARNING_UNARCHIVE',
	REGISTERED_LEARNER_ALL_ORGANISATIONS = 'REGISTERED_LEARNER_ALL_ORGANISATIONS',
}

export enum CompoundRole {
	ANY,
	ALL
}

export abstract class CompoundRoleBase {
	constructor(public roles: Role[]) { }

	public abstract checkRoles(userRoles: string[]): boolean
	public abstract getType(): CompoundRole
	public abstract getDescription(): string

	toString() {
		return `${this.getDescription()}`
	}
}

export class AnyOfCompoundRole extends CompoundRoleBase {
	public checkRoles(userRoles: string[]): boolean {
		return this.roles.some(r => userRoles.includes(r))
	}

	getType(): CompoundRole {
		return CompoundRole.ANY
	}

	getDescription(): string {
		return `ANY of the following roles: [${this.roles}]`
	}
}

export const Any = (...roles: Role[]) => {
	return new AnyOfCompoundRole(roles)
}

export const All = (...roles: Role[]) => {
	return new AllOfCompoundRole(roles)
}

export class AllOfCompoundRole extends CompoundRoleBase {
	public checkRoles(userRoles: string[]): boolean {
		return this.roles.every(r => userRoles.includes(r))
	}

	getType(): CompoundRole {
		return CompoundRole.ALL
	}

	getDescription(): string {
		return `ALL of the following roles: [${this.roles}]`
	}
}

export interface IUserRole {
	checkRoles(userRoles: string[]): boolean
	getDescription(): string
}

export class UserRole implements IUserRole {
	public compoundRoles: CompoundRoleBase[]
	constructor(...compoundRoles: CompoundRoleBase[]) {
		this.compoundRoles = compoundRoles
	}

	getDescription(): string {
        return "[" + this.compoundRoles.map(r => r.getDescription()).join(" AND ") + "]"
    }

	public checkRoles(userRoles: string[]): boolean {
		let authorised = true
		for (const compoundRole of this.compoundRoles) {
			if (!compoundRole.checkRoles(userRoles)) {
				authorised = false
			}
		}
		return authorised
	}
}

export class ORUserRole implements IUserRole {
	public compoundRoles: IUserRole[]
	constructor(...roles: IUserRole[]) {
		this.compoundRoles = roles
	}

	getDescription(): string {
        return this.compoundRoles.map(r => r.getDescription()).join(" OR ")
    }

	public checkRoles(userRoles: string[]): boolean {
		let authorised = false
		for (const compoundRole of this.compoundRoles) {
			if (compoundRole.checkRoles(userRoles)) {
				return true
			}
		}
		return authorised
	}
}

export const superAdminRole = new UserRole(Any(Role.LEARNING_MANAGER))

const buildSuperUserRole = (role: IUserRole): IUserRole => {
	return new ORUserRole(role, superAdminRole)
}

// Reporting
export const reporterRole = new UserRole(Any(Role.CSHR_REPORTER,
Role.ORGANISATION_REPORTER, Role.REGISTERED_LEARNER_REPORTER))
export const registeredLearnerReportingRole = new UserRole(All(Role.REGISTERED_LEARNER_REPORTER), Any(Role.ORGANISATION_REPORTER, Role.CSHR_REPORTER))
export const mvpReportingRole = new UserRole(All(Role.MVP_REPORTER), Any(Role.ORGANISATION_REPORTER, Role.CSHR_REPORTER))
export const mvpExportRole = new UserRole(...mvpReportingRole.compoundRoles, All(Role.REPORT_EXPORT))

// Course authoring
export const authorRoles = Any(Role.ORGANISATION_AUTHOR, Role.CSL_AUTHOR, Role.KPMG_SUPPLIER_AUTHOR)
const buildAuthorRole = (...roles: Role[]): IUserRole => {
	return buildSuperUserRole(new UserRole(authorRoles, Any(...roles)))
}

export const learningViewingRole = buildSuperUserRole(new UserRole(authorRoles))
export const learningCreateRole = buildAuthorRole(Role.LEARNING_CREATE)
export const learningPublishRole = buildAuthorRole(Role.LEARNING_PUBLISH)
export const learningArchiveRole = buildAuthorRole(Role.LEARNING_ARCHIVE)
export const learningUnarchiveRole = buildAuthorRole(Role.LEARNING_UNARCHIVE)
export const learningEditRole = buildAuthorRole(Role.LEARNING_EDIT)
export const learningDeleteRole = buildAuthorRole(Role.LEARNING_DELETE)

// Organisation management
export const organisationManagerRole = new UserRole(Any(Role.ORGANISATION_MANAGER, Role.LEARNING_MANAGER))

export class IdentityDetails {
	constructor(public uid: string, public username: string, public roles: string[], public accessToken: string) { }
}

export function createIdentity(identityDetails: IdentityDetails, profile: Profile) {
	return new Identity(identityDetails.uid, identityDetails.username, identityDetails.roles, identityDetails.accessToken,
		profile.managementLoggedIn, profile.managementShouldLogout, profile.uiLoggedIn, profile.uiShouldLogout, profile.shouldRefresh,
		profile.organisationalUnit, profile.otherOrganisationalUnits, profile.fullName)

}

export class Identity {

	constructor(
	public readonly uid: string,
	public readonly username: string,
	public roles: string[],
	public readonly accessToken: string,
	public managementLoggedIn: boolean = false,
	public managementShouldLogout: boolean = false,
	public uiLoggedIn: boolean = false,
	public uiShouldLogout: boolean = false,
	public shouldRefresh: boolean = false,
	public organisationalUnit?: OrganisationalUnit,
	public otherOrganisationalUnits: OrganisationalUnit[] = [],
	public fullName?: string,) { }

	updateWithProfile(profile: Profile) {
		this.managementLoggedIn = profile.managementLoggedIn
		this.managementShouldLogout = profile.managementShouldLogout
		this.uiLoggedIn = profile.uiLoggedIn
		this.uiShouldLogout = profile.uiShouldLogout
		this.shouldRefresh = profile.shouldRefresh
		this.organisationalUnit = profile.organisationalUnit
		this.fullName = profile.fullName
	}

	isProfileComplete() {
		return this.fullName && this.organisationalUnit
	}

	getDomain() {
		return this.username.split("@")[1].toLowerCase()
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
			Role.LEARNING_ARCHIVE,
			Role.LEARNING_CREATE,
			Role.LEARNING_DELETE,
			Role.LEARNING_EDIT,
			Role.LEARNING_MANAGER,
			Role.LEARNING_PUBLISH,
			Role.ORGANISATION_AUTHOR,
			Role.ORGANISATION_MANAGER,
			Role.ORGANISATION_REPORTER,
			Role.REGISTERED_LEARNER_REPORTER
		])
	}

	isMVPReporter() {
		return this.hasRole(Role.MVP_REPORTER) && (this.isOrganisationReporter() || this.isCshrReporter())
	}

	roleCheck(role: IUserRole) {
		return role.checkRoles(this.roles)
	}

	isRegisteredLearnerReporter() {
		return this.roleCheck(registeredLearnerReportingRole)
	}

	hasMvpExport() {
		return this.roleCheck(mvpExportRole)
	}

	hasEventViewingRole() {
		// coarse-grained check for general permission to view events
		return this.roleCheck(learningViewingRole)
	}

	isOrganisationManager() {
		return this.roleCheck(organisationManagerRole)
	}

	isLearningManager() {
		return this.hasRole(Role.LEARNING_MANAGER)
	}

	isSuperUser() {
		return this.isLearningManager()
	}

	hasLearningCreate() {
		return this.roleCheck(learningCreateRole)
	}

	hasLearningEdit() {
		return this.roleCheck(learningEditRole)
	}

	hasLearningDelete() {
		return this.roleCheck(learningDeleteRole)
	}

	hasLearningPublish() {
		return this.roleCheck(learningPublishRole)
	}

	hasLearningArchive() {
		return this.roleCheck(learningArchiveRole)
	}

	hasLearningUnarchive() {
		return this.roleCheck(learningUnarchiveRole)
	}

	isReporter() {
		return this.roleCheck(reporterRole)
	}

	isCshrReporter() {
		return this.hasRole('CSHR_REPORTER')
	}

	isOrganisationReporter() {
		return this.hasRole(Role.ORGANISATION_REPORTER)
	}

	isSkillsManagerOrSuperUser() {
		return this.isSuperUser()
	}

	isUnrestrictedOrganisation() {
		return this.hasRole(Role.UNRESTRICTED_ORGANISATION)
	}

	isReportingAllOrganisations() {
		return this.hasRole(Role.REPORTING_ALL_ORGANISATIONS)
	}

	isRegisteredLearnerAllOrganisations() {
		return this.hasRole(Role.REGISTERED_LEARNER_ALL_ORGANISATIONS)
	}

	isTierOneReporter(){
		return this.hasRole(Role.TIER1_REPORTING)
	}
}
