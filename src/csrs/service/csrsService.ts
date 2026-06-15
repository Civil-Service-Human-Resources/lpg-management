import {CacheService} from '../../lib/cache/cacheService'
import {OauthRestService} from '../../lib/http/oauthRestService'
import {JsonpathService} from '../../lib/jsonpathService'
import {FormattedOrganisation} from '../../csl-service/model/organisationalUnit/FormattedOrganisation'
import {OrganisationalUnitService} from './organisationalUnitService'

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

	async getDepartmentCodeToNameMapping() {
		const dropdown = await this.organisationalUnitService.getAllOrganisationsTypeahead()
		return dropdown.reduce((map: any, object: FormattedOrganisation) => {
			map[object.code] = object.getName()
			return map
		}, {})
	}

	async getDepartmentAbbreviationsFromCodes(codes: string[]) {
		const dropdown = await this.organisationalUnitService.getAllOrganisationsTypeahead()
		return dropdown.filter(o => codes.includes(o.code) && o.abbreviation).map(o => o.abbreviation!)
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

	async getAllOrganisations() {
		return await this.organisationalUnitService.getAllOrganisationsTypeahead()
	}
}
