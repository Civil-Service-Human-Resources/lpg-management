import {OauthRestService} from 'lib/http/oauthRestService'
import {plainToInstance} from 'class-transformer'
import {TaxonomyTree} from '../../lib/taxonomy/taxonomyTree'
import {LearningTag} from '../model/learningTag/learningTag'
import {AxiosResponse} from 'axios'

export class LearningTagClient {

	private LEARNING_TAGS_URL = "/learning-tags"
	private TREE_URL = `${this.LEARNING_TAGS_URL}/overview-tree`

	constructor(private readonly _http: OauthRestService,) {
	}

	private async buildLearningTagResponse(response: Promise<AxiosResponse<LearningTag>>) {
		return plainToInstance(LearningTag, (await response).data)
	}

	async getTree() {
		return plainToInstance(TaxonomyTree, (await this._http.getRequest<TaxonomyTree>({
			url: this.TREE_URL
		})).data)
	}

	async get(id: number) {
		return await this.buildLearningTagResponse(this._http.getRequest<LearningTag>({
			url: `${this.LEARNING_TAGS_URL}/${id}`
		}));
	}
}