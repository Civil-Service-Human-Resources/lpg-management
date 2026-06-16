import {getLogger} from '../../utils/logger'
import {plainToInstance} from 'class-transformer'
import {LearningTagTaxonomyNodePageModel} from '../../controllers/learningTag/model/learningTagTaxonomyNodePageModel'
import {LearningTagClient} from '../client/learningTagClient'
import {LearningTagTreeCache} from '../../csl-service/model/learning/learningTag/LearningTagTreeCache'
import {LearningTagCache} from '../../csl-service/model/learning/learningTag/learningTagCache'
import {LearningTag} from '../model/learningTag/learningTag'

export class LearningTagService {
	logger = getLogger('LearningTagService')

	constructor(private readonly learningTagTreeCache: LearningTagTreeCache,
				private readonly learningTagCache: LearningTagCache,
				private readonly learningTagClient: LearningTagClient) { }

	async getTree(): Promise<LearningTagTaxonomyNodePageModel[]> {
		const tree = await this.learningTagTreeCache.get()
		return plainToInstance(LearningTagTaxonomyNodePageModel, tree.content)
	}

	async getLearningTag(learningTagId: number): Promise<LearningTag> {
		let learningTag = await this.learningTagCache.get(learningTagId)
		if (learningTag === undefined) {
			learningTag = await this.learningTagClient.get(learningTagId)
			await this.learningTagCache.setObject(learningTag)
		}
		return learningTag
	}

}