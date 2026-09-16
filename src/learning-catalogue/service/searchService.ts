import {buildParams} from '../model/search/courseSearchParams'
import {Request} from 'express'
import {SearchFilterQuery} from '../../controllers/models/searchFilterQuery'
import {LearningCatalogue} from '../index'
import {Filters, SearchPageModel} from '../../controllers/models/searchPageModel'
import {PaginationService} from '../../lib/paginationService'

export type i18nFilters = 'courseTypes' | 'courseStatuses' | 'courseVisibilities'

export class SearchService {
	constructor(private learningCatalogue: LearningCatalogue,
				private pagination: PaginationService) {
	}

	async searchForCourses(params: SearchFilterQuery, req: Request) {
		const searchQuery = buildParams(params)
		const searchResults = await this.learningCatalogue.searchCourses(searchQuery)
		const filters: Filters = {
			showFree: params.cost !== undefined && params.cost === 'free',
			selectedLearningTypes: this.getFilterFromI18n(req, 'courseTypes', params.courseType),
			selectedVisibility: this.getFilterFromI18n(req, 'courseVisibilities', params.visibility),
			selectedStatuses: this.getFilterFromI18n(req, 'courseStatuses', params.status),
		}

		const pagination = this.pagination.getPagination(params, searchResults)
		return new SearchPageModel(filters, params.q, searchResults.results, pagination)
	}

	getFilterFromI18n(req: Request, key: i18nFilters, selectedParams: string[]) {
		// @ts-ignore
		return Object.entries(req.i18n_texts[key]).map((value: [string, string]) => {
			return {
				label: value[1],
				value: value[0],
				checked: selectedParams.includes(value[0]),
				id: value[0],
			}
		})
	}

}

