import {SubmittableForm} from '../../models/submittableForm'
import {IsNotEmpty} from 'class-validator'
import {PaginationPage} from '../../../lib/paginationService'
import {Hyperlink} from '../../../learning-catalogue/model/learningTag/hyperlink'
import {Transform} from 'class-transformer'
import {transformStringArray} from '../../../utils/transformUtils'

export class RemoveHyperlinksFromLearningTagPageModel extends SubmittableForm {

	public results?: Hyperlink[]
	public pagePagination?: PaginationPage

	@IsNotEmpty({
		message: 'learningTags.validation.hyperlinks.emptySelection'
	})
	@Transform(transformStringArray)
	public hyperlinkIds: string[]
	public allIds: string

	constructor(results?: Hyperlink[], pagePagination?: PaginationPage) {
		super()
		this.results = results
		this.pagePagination = pagePagination
		this.allIds = (results || []).map(h => h.id).join(",")
	}

	getHyperlinkIds() {
		return (this.hyperlinkIds.length === 1 && this.hyperlinkIds[0] === 'all') ? this.allIds.split(",") : this.hyperlinkIds
	}

	setResults(results: Hyperlink[]) {
		this.results = results
		this.allIds = (results || []).map(h => h.id).join(",")
	}
}
