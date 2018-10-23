import {JsonRestService} from '../lib/http/jsonRestService'

export class YoutubeRestService extends JsonRestService {
	protected getHeaders() {
		return {
			headers: {
				'Content-Type': 'application/json',
			},
		}
	}
}
