import {getLogger} from '../../utils/logger'
import {LearningTagTreeCache} from '../../csl-service/model/learning/learningTag/LearningTagTreeCache'
import {plainToInstance} from 'class-transformer'
import {LearningTagTaxonomyNodePageModel} from '../../controllers/learningTag/model/learningTagTaxonomyNodePageModel'

export class LearningTagService {
	logger = getLogger('LearningTagService')

	constructor(private readonly learningTagTreeCache: LearningTagTreeCache) { }

	async getTree(): Promise<LearningTagTaxonomyNodePageModel[]> {
		const tree = await this.learningTagTreeCache.get()
		return plainToInstance(LearningTagTaxonomyNodePageModel, tree.content)
	}

}