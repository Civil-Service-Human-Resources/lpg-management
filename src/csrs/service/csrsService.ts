import { CacheService } from '../../lib/cacheService';
import { OauthRestService } from '../../lib/http/oauthRestService';
import { JsonpathService } from '../../lib/jsonpathService';
import { CivilServant } from '../model/civilServant';
import { OrganisationalUnit } from '../model/organisationalUnit';
import { OrganisationalUnitService } from './organisationalUnitService';

export class CsrsService {

	static readonly DEPARTMENT_CODE_TO_NAME_MAPPING = 'CsrsService.departmentCodeToNameMapping'
	static readonly AREAS_OF_WORK = 'CsrsService.areasOfWork'
	static readonly GRADES = 'CsrsService.grades'
	static readonly GRADE_CODE_TO_NAME_MAPPING = 'CsrsService.gradeCodeToNameMapping'
	static readonly INTERESTS = 'CsrsService.interests'
	static readonly DEPARTMENT_CODE_TO_ABBREVIATION_MAPPING = 'CsrsService.departmentCodeToAbbreviationMapping'

	constructor(
		private readonly restService: OauthRestService,
		private readonly cacheService: CacheService,
		private readonly organisationalUnitService: OrganisationalUnitService) {}

	async editDescription(data: any, user: any) {
		return await this.restService.postWithoutFollowingWithConfig('api/quiz/update',
			data,
			this.getAuthorizationHeader(user))
	}

	async editQuestion(question: any, user: any) {
		return await this.restService.postWithoutFollowingWithConfig('api/questions/update', question, this.getAuthorizationHeader(user))
	}

	async getCivilServant() {
		return await this.restService.get('/civilServants/me')
	}

	async getCivilServantWithUid(userId: string): Promise<CivilServant> {
		return await this.restService.get(`/civilServants/resource/${userId}`)
	}

	async createQuizByProfessionID(data: any, user: any) {
		return await this.restService.postWithoutFollowingWithConfig('/api/quiz',
			data,
			this.getAuthorizationHeader(user)
		)
	}

	async deleteQuizByProfession(professionID: number, user: any): Promise<void> {
		await this.restService.deleteWithConfig(`/api/quiz/delete?professionId=${professionID}`, this.getAuthorizationHeader(user))
	}

	async deleteQuestionbyID(id: string, user: any): Promise<void> {
		await this.restService.deleteWithConfig(`/api/questions/${id}/delete`, this.getAuthorizationHeader(user))
	}

	async postQuestion(data: any, user: any) {
		return await this.restService.postWithoutFollowingWithConfig('/api/questions/add-question',
			data,
			this.getAuthorizationHeader(user)
		)
	}

	async getQuestionbyID(questionID: any, user: any) {
		return await this.restService.getWithConfig(`/api/questions/${questionID}/preview`, this.getAuthorizationHeader(user))
	}

	async getResultsByProfession(professionID: any, user: any) {
		return await this.restService.getWithConfig(`/api/quiz/results-by-profession?professionId=${professionID}`, this.getAuthorizationHeader(user))
	}

	async publishSkills(data: any, user: any) {
		return await this.restService.putWithConfig(`/api/quiz/publish`, data, this.getAuthorizationHeader(user) )
	}

	async getQuizByProfession(professionID: any, user: any) {
		return await this.restService.getWithConfig(`/api/quiz/${professionID}`, this.getAuthorizationHeader(user))
	}

	async getAllQuizResults(user: any) {
		return await this.restService.getWithConfig(`/api/quiz/all-results`, this.getAuthorizationHeader(user))
	}

	async getQuizesByOrg(orgID: any, user: any) {
		return await this.restService.getWithConfig(`api/quiz/results-for-your-org?organisationId=${orgID}`, this.getAuthorizationHeader(user))
	}

	private getAuthorizationHeader(user: any) {
		return {
			headers: {
				Authorization: `Bearer ${user.accessToken}`,
			},
		}
	}

	async getAreasOfWork() {
		let areasOfWork = await this.restService.get('/professions/flat')

		return areasOfWork
	}

	async isAreaOfWorkValid(areaOfWork: string) {
		const areaOfWorkLookupResult = JsonpathService.queryWithLimit(await this.getAreasOfWork(), `$..professions[?(@.name==${JSON.stringify(areaOfWork)})]`, 1)
		return areaOfWorkLookupResult.length > 0
	}

	async getGrades() {
		let grades = this.cacheService.cache.get(CsrsService.GRADES)

		if (!grades) {
			grades = await this.restService.get('/grades')
			this.cacheService.cache.set(CsrsService.GRADES, grades)
		}

		return grades
	}

	async isGradeCodeValid(gradeCode: string) {
		const gradesLookupResult = JsonpathService.queryWithLimit(await this.getGrades(), `$..grades[?(@.code==${JSON.stringify(gradeCode)})]`, 1)

		return gradesLookupResult.length > 0
	}

	async isCoreLearningValid(interest: string) {
		const interestsLookupResult = JsonpathService.queryWithLimit(await this.getCoreLearning(), `$..interests[?(@.name==${JSON.stringify(interest)})]`, 1)
		return interestsLookupResult.length > 0
	}

	async getCoreLearning() {
		let interests = this.cacheService.cache.get(CsrsService.INTERESTS)

		if (!interests) {
			interests = await this.restService.get('/interests')
			this.cacheService.cache.set(CsrsService.INTERESTS, interests)
		}

		return interests
	}

	async listOrganisationalUnitsForTypehead() {
		return await this.organisationalUnitService.getOrgDropdown()
	}

	async getDepartmentCodeToNameMapping() {
		const dropdown = await this.organisationalUnitService.getOrgDropdown()
		return dropdown.typeahead.reduce((map: any, object: OrganisationalUnit) => {
			map[object.code] = object.name
			return map
		}, {})
	}

	async getDepartmentCodeToAbbreviationMapping() {
		const dropdown = await this.organisationalUnitService.getOrgDropdown()
		return dropdown.typeahead.reduce((map: any, object: OrganisationalUnit) => {
			map[object.code] = object.abbreviation
			return map
		}, {})
	}

	async getGradeCodeToNameMapping() {
		return this.getCodeToNameMapping(this.getGrades, '$._embedded.grades.*', CsrsService.GRADE_CODE_TO_NAME_MAPPING)
	}

	private async getCodeToNameMapping(functionToRetrieveMappingFromBackend: () => Promise<any>, pathForMapObjects: string, cacheKey: string) {
		let mapping = this.cacheService.cache.get(cacheKey)

		if (!mapping) {
			const codeNameObjectArray = JsonpathService.query(await functionToRetrieveMappingFromBackend.call(this), pathForMapObjects)

			mapping = codeNameObjectArray.reduce((map: any, object: any) => {
				map[object.code] = object.name
				return map
			}, {})

			this.cacheService.cache.set(cacheKey, mapping)
		}

		return mapping
	}

	async findByName(name: string) {
		return await this.restService.get(`/professions/search/findByName?name=${name}`)
	}

	async getReportForSuperAdmin(startDate: any, endDate: any, professionID: any, user:any) {
		let reportUrl = `/report/skills/report-for-super-admin?from=${startDate}&to=${endDate}&professionId=${professionID}`

		return await this.restService.getWithConfig(reportUrl, this.getAuthorizationHeader(user))
	}

	async getReportForOrgAdmin(startDate: any, endDate: any, organisationID: any, professionID: any, user: any) {
		let reportUrl = `/report/skills/report-for-department-admin?from=${startDate}&to=${endDate}&organisationId=${organisationID}&professionId=${professionID}`

		return await this.restService.getWithConfig(reportUrl, this.getAuthorizationHeader(user))
	}

	async getReportForProfAdmin(startDate: any, endDate: any, professionID: any, user: any) {

		let reportUrl = `/report/skills/report-for-profession-admin?from=${startDate}&to=${endDate}&professionId=${professionID}`

		return await this.restService.getWithConfig(reportUrl, this.getAuthorizationHeader(user))
	}

}
