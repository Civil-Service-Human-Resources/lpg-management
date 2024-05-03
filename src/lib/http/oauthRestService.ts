import {JsonRestService} from './jsonRestService'

export class OauthRestService extends JsonRestService {
	protected getHeaders() {
		return {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.auth?.currentUser.accessToken}`,
			},
		}
	}
}
