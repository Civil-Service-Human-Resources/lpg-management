import {OauthRestService} from 'lib/http/oauthRestService'
import {plainToInstance} from 'class-transformer'
import {TaxonomyTree} from '../../lib/taxonomy/taxonomyTree'

export class LearningTagClient {

	private LEARNING_TAGS_URL = "/learning-tags"
	private TREE_URL = `${this.LEARNING_TAGS_URL}/overview-tree`

	constructor(private readonly _http: OauthRestService,) {
	}

	async getTree() {
		return plainToInstance(TaxonomyTree, (await this._http.getRequest<TaxonomyTree>({
			url: this.TREE_URL
		})).data)
	}
}