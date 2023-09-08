import {OauthRestService} from 'lib/http/oauthRestService'

export class CslServiceClient {

	constructor(private readonly _http: OauthRestService) { }

	async clearCourseRecordCache(userId: string, courseId: string) {
		await this._http.get(`/reset-cache/learner/${userId}/course_record/${courseId}`)
	}
}
