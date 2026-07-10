import {getLogger} from '../../utils/logger'
import {LearningTagTaxonomyNodePageModel} from '../../controllers/learningTag/model/learningTagTaxonomyNodePageModel'
import {LearningTag} from '../model/learningTag/learningTag'
import {LearningTagCacheManager} from '../../csl-service/model/learning/learningTag/learningTagCacheManager'
import {plainToInstance} from 'class-transformer'
import {LearningTagClient} from '../client/learningTagClient'
import {FormattedTaxonomyItem} from '../../lib/taxonomy/formattedTaxonomyItem'
import {FormattedTaxonomyItemList} from '../../lib/taxonomy/formattedTaxonomyItemList'
import {LearningTagPageModel} from '../../controllers/learningTag/model/learningTagPageModel'

export class LearningTagService {
	logger = getLogger('LearningTagService')

	constructor(private readonly learningTagCacheManager: LearningTagCacheManager,
				private readonly learningTagClient: LearningTagClient) { }

	async getTree(): Promise<LearningTagTaxonomyNodePageModel[]> {
		const tree = await this.learningTagCacheManager.getTree()
		return plainToInstance(LearningTagTaxonomyNodePageModel, tree)
	}

	async getPageModel(learningTag?: LearningTag, includeDropdown: boolean = false) {
		const data = new LearningTagPageModel([])
		if (includeDropdown) {
			data.parentTags = await this.getTypeahead()
		}
		if (learningTag !== undefined) {
			data.id = learningTag.id
			data.name = learningTag.name
			data.code = learningTag.code
			data.description = learningTag.description
			data.parentId = learningTag.parentId
			data.category = learningTag.category
			data.urlSlug = learningTag.urlSlug
		}
		return data
	}

	async validatePageModel() {

	}

	async getLearningTag(learningTagId: number): Promise<LearningTag> {
		let org = await this.learningTagCacheManager.get(learningTagId)
		if (org === undefined) {
			org = await this.learningTagClient.get(learningTagId)
			await this.learningTagCacheManager.update(org)
		}
		return org
	}

	async getTypeahead(): Promise<FormattedTaxonomyItem[]> {
		let typeahead = await this.learningTagCacheManager.getAllTypeahead()
		if (typeahead === undefined) {
			const formattedOrganisations = await this.learningTagClient.getFormattedList()
			typeahead = new FormattedTaxonomyItemList("all", formattedOrganisations.names)
			await this.learningTagCacheManager.setAllTypeahead(typeahead)
		}
		return typeahead.names
	}

	async create(pageModel: LearningTagPageModel): Promise<LearningTag> {
		const learningTag = await this.learningTagClient.create(pageModel)
		await this.learningTagCacheManager.updateAndRefresh(learningTag)
		return learningTag
	}

	async update(learningTag: LearningTag, pageModel: LearningTagPageModel) {
		this.logger.debug(`Updating learningTag ${learningTag.id} with page model ${JSON.stringify(pageModel)}`)
		learningTag = await this.learningTagClient.update(learningTag.id, pageModel)
		await this.learningTagCacheManager.updateAndRefresh(learningTag)
		return learningTag
	}
}