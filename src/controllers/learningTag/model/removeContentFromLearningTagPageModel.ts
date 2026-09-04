import {SubmittableForm} from '../../models/submittableForm'
import {PaginationPage} from '../../../lib/paginationService'
import {BasicCourse} from '../../../learning-catalogue/courseTypeAhead'
import {Hyperlink} from '../../../learning-catalogue/model/learningTag/hyperlink'

export type ContentType = BasicCourse | Hyperlink

export class RemoveContentFromLearningTagPageModel<T extends ContentType> extends SubmittableForm {

	public results?: T[]
	public pagePagination?: PaginationPage
	public ids: string[]
	public allIds: string

	constructor(results?: T[], pagePagination?: PaginationPage) {
		super()
		this.results = results
		this.pagePagination = pagePagination
		this.allIds = (results || []).map(h => h.id).join(",")
	}

	getIds() {
		return (this.ids.length === 1 && this.ids[0] === 'all') ? this.allIds.split(",") : this.ids
	}

	setResults(results: T[]) {
		this.results = results
		this.allIds = (results || []).map(h => h.id).join(",")
	}
}
