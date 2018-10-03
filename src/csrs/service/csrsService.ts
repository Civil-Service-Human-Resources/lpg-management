import {OauthRestService} from '../../lib/http/oauthRestService'
import {JsonpathService} from '../../lib/jsonpathService'
import {CacheService} from '../../lib/cacheService'

export class CsrsService {
	restService: OauthRestService
	cacheService: CacheService

	static readonly DEPARTMENT_CODE_TO_NAME_MAPPING = 'CsrsService.departmentCodeToNameMapping'
	static readonly AREAS_OF_WORK = 'CsrsService.areasOfWork'
	static readonly GRADES = 'CsrsService.grades'
	static readonly GRADE_CODE_TO_NAME_MAPPING = 'CsrsService.gradeCodeToNameMapping'
	static readonly INTERESTS = 'CsrsService.interests'

	constructor(restService: OauthRestService, cacheService: CacheService) {
		this.restService = restService
		this.cacheService = cacheService
	}

	async getOrganisations() {
		return await this.restService.get('organisations')
	}

	async getAreasOfWork() {
		let areasOfWork = this.cacheService.cache.get(CsrsService.AREAS_OF_WORK)

		if (!areasOfWork) {
			areasOfWork = await this.restService.get('professions')
			this.cacheService.cache.set(CsrsService.AREAS_OF_WORK, areasOfWork)
		}

		return areasOfWork
	}

	async isAreaOfWorkValid(areaOfWork: string) {
		const areaOfWorkLookupResult = JsonpathService.queryWithLimit(
			await this.getAreasOfWork(),
			`$..professions[?(@.name==${JSON.stringify(areaOfWork)})]`,
			1
		)
		return areaOfWorkLookupResult.length > 0
	}

	async getGrades() {
		let grades = this.cacheService.cache.get(CsrsService.GRADES)

		if (!grades) {
			grades = await this.restService.get('grades')
			this.cacheService.cache.set(CsrsService.GRADES, grades)
		}

		return grades
	}

	async isGradeCodeValid(gradeCode: string) {
		const gradesLookupResult = JsonpathService.queryWithLimit(
			await this.getGrades(),
			`$..grades[?(@.code==${JSON.stringify(gradeCode)})]`,
			1
		)

		return gradesLookupResult.length > 0
	}

	async isCoreLearningValid(interest: string) {
		const interestsLookupResult = JsonpathService.queryWithLimit(
			await this.getCoreLearning(),
			`$..interests[?(@.name==${JSON.stringify(interest)})]`,
			1
		)
		return interestsLookupResult.length > 0
	}

	async getCoreLearning() {
		let interests = this.cacheService.cache.get(CsrsService.INTERESTS)

		if (!interests) {
			interests = await this.restService.get('interests')
			this.cacheService.cache.set(CsrsService.INTERESTS, interests)
		}

		return interests
	}

	async getDepartmentCodeToNameMapping() {
		return this.getCodeToNameMapping(
			this.getOrganisations,
			'$._embedded.organisations.*',
			CsrsService.DEPARTMENT_CODE_TO_NAME_MAPPING
		)
	}

	async getGradeCodeToNameMapping() {
		return this.getCodeToNameMapping(this.getGrades, '$._embedded.grades.*', CsrsService.GRADE_CODE_TO_NAME_MAPPING)
	}

	private async getCodeToNameMapping(
		functionToRetrieveMappingFromBackend: () => Promise<any>,
		pathForMapObjects: string,
		cacheKey: string
	) {
		let mapping = this.cacheService.cache.get(cacheKey)

		if (!mapping) {
			const codeNameObjectArray = JsonpathService.query(
				await functionToRetrieveMappingFromBackend.call(this),
				pathForMapObjects
			)

			mapping = codeNameObjectArray.reduce((map: any, object: any) => {
				map[object.code] = object.name
				return map
			}, {})

			this.cacheService.cache.set(cacheKey, mapping)
		}

		return mapping
	}
}
