import {plainToInstance} from 'class-transformer'
import {TaxonomyTree} from '../../lib/taxonomy/taxonomyTree'
import {LearningTag} from '../model/learningTag/learningTag'
import {AxiosResponse} from 'axios'
import {
	FormattedTaxonomyItemListResponse,
} from '../../csl-service/model/learning/learningTag/formattedTaxonomyItemListResponse'
import {OauthRestService} from '../../lib/http/oauthRestService'
import {LearningTagPageModel} from '../../controllers/learningTag/model/learningTagPageModel'
import {SearchQuery} from '../../controllers/models/searchQuery'
import {LearningTagCoursesResponse} from '../model/learningTag/learningTagCoursesResponse'
import {LearningTagStateUpdate} from '../model/learningTag/learningTagStateUpdate'

export class LearningTagClient {

	private LEARNING_TAGS_URL = "/learning-tags"
	private TREE_URL = `${this.LEARNING_TAGS_URL}/overview-tree`
	private FORMATTED_LIST_URL = `${this.LEARNING_TAGS_URL}/formatted_list`

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

	async getFormattedList() {
		const response = await this._http.getRequest({
			url: this.FORMATTED_LIST_URL
		})
		return plainToInstance(FormattedTaxonomyItemListResponse, response.data)
	}

	async create(data: LearningTagPageModel) {
		return await this.buildLearningTagResponse(this._http.postRequest<LearningTag>({
			url: this.LEARNING_TAGS_URL,
			data
		}));
	}

	async update(id: number, data: LearningTagPageModel) {
		return await this.buildLearningTagResponse(this._http.putRequest<LearningTag>({
			url: `${this.LEARNING_TAGS_URL}/${id}`,
			data
		}));
	}

	async getTaggedCourses(id: number, searchQuery: SearchQuery): Promise<LearningTagCoursesResponse> {
		const resp = await this._http.getRequest({
			url: `${this.LEARNING_TAGS_URL}/${id}/courses`,
			params: {
				page: searchQuery.p
			}
		})
		return plainToInstance(LearningTagCoursesResponse, resp.data)
	}

	async updateState(id: number, state: LearningTagStateUpdate) {
		return await this.buildLearningTagResponse(this._http.putRequest<LearningTag>({
			url: `${this.LEARNING_TAGS_URL}/${id}/state`,
			data: {
				state
			}
		}));
	}

	async removeCourses(id: number, courseIds: string[]) {
		return (await this._http.deleteRequest<{successfulIds: string[], failedIds: string[]}>({
			url: `${this.LEARNING_TAGS_URL}/${id}/courses`,
			data: {
				ids: courseIds
			}
		})).data
	}
}