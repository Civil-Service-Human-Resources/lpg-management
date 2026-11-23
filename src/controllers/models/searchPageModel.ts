import {Course} from '../../learning-catalogue/model/course'
import {Pagination} from '../../lib/paginationService'

export interface SearchLabel {
	id: string
	value: string
	label: string
}

export interface SearchFilter extends SearchLabel {
	checked: boolean
}

export interface Filters {
	selectedLearningTypes: SearchFilter[]
	showFree: boolean
	selectedStatuses: SearchFilter[]
	selectedVisibility: SearchFilter[]
}

export class SearchPageModel {
	constructor(
		public filters: Filters,
		public query: string,
		public searchResults: Course[],
		public pagination: Pagination
	) {}
}
