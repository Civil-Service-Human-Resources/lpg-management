import {LearningTagService} from '../../../learning-catalogue/service/learningTagService'
import {ContentSearchParams} from '../model/contentSearchParams'
import {PaginationService} from '../../../lib/paginationService'
import {LearningTagContentManagementControllerBase} from './learningTagContentManagementControllerBase'
import {RemoveHyperlinksFromLearningTagPageModel} from '../model/removeHyperlinksFromLearningTagPageModel'
import {
	LearningTagHyperlinksResponse,
} from '../../../learning-catalogue/model/learningTag/learningTagHyperlinksResponse'
import {Hyperlink} from '../../../learning-catalogue/model/learningTag/hyperlink'

export class LearningTagHyperlinksManagementController extends LearningTagContentManagementControllerBase<Hyperlink> {
	
	constructor(learningTagService: LearningTagService, pagination: PaginationService) {
		super(learningTagService, 'hyperlinks', RemoveHyperlinksFromLearningTagPageModel, pagination)
	}

	remove = async (learningTagId: number, ids: string[]): Promise<string> => {
		return await this.learningTagService.removeHyperlinks(learningTagId, ids)
	}

	getResults = async (learningTagId: number, params: ContentSearchParams): Promise<LearningTagHyperlinksResponse> => {
		return await this.learningTagService.getHyperlinksPage(learningTagId, params)
	}

}
