import {OauthRestService} from '../../lib/http/oauthRestService'
import {JsonpathService} from '../../lib/jsonpathService'
import {CacheService} from '../../lib/cacheService'

export class CsrsService {
	restService: OauthRestService
	cacheService: CacheService

	static readonly DEPARTMENT_CODE_TO_NAME_MAPPING = 'CsrsService.departmentCodeToNameMapping'
	static readonly AREAS_OF_WORK = 'CsrsService.areasOfWork'

	constructor(restService: OauthRestService, cacheService: CacheService) {
		this.restService = restService
		this.cacheService = cacheService
	}

	async getOrganisations() {
		return await this.restService.get('organisations')
	}

	async getAreasOfWork() {
		let areasOfWork = this.cacheService.cache.get(CsrsService.AREAS_OF_WORK)

		if (areasOfWork == undefined) {
			areasOfWork = await this.restService.get('professions')
			this.cacheService.cache.set(CsrsService.AREAS_OF_WORK, areasOfWork)
		}

		return areasOfWork
	}

	async isAreaOfWorkValid(areaOfWork: string) {
		const areaOfWorkLookupResult = JsonpathService.jsonpath().query(
			await this.getAreasOfWork(),
			`$..professions[?(@.name==${JSON.stringify(areaOfWork)})]`,
			1
		)
		return areaOfWorkLookupResult.length > 0
	}

	async getGrades() {
		return await this.restService.get('grades')
	}

	async isCoreLearningValid(interests: string) {
		const interestsLookupResult = JsonpathService.jsonpath().query(
			await this.getCoreLearning(),
			`$..interests[?(@.name==${JSON.stringify(interests)})]`,
			1
		)
		return interestsLookupResult.length > 0
	}

	async getCoreLearning() {
		return await this.restService.get('interests')
	}

	async getDepartmentCodeToNameMapping() {
		let departmentCodeToNameMapping = this.cacheService.cache.get(CsrsService.DEPARTMENT_CODE_TO_NAME_MAPPING)

		if (departmentCodeToNameMapping == undefined) {
			const organisations = JsonpathService.jsonpath().query(
				await this.getOrganisations(),
				'$._embedded.organisations.*'
			)

			departmentCodeToNameMapping = organisations.reduce((map: any, organisation: any) => {
				map[organisation.code] = organisation.name
				return map
			}, {})

			this.cacheService.cache.set(CsrsService.DEPARTMENT_CODE_TO_NAME_MAPPING, departmentCodeToNameMapping)
		}

		return departmentCodeToNameMapping
	}
}
