import {OauthRestService} from '../lib/http/oauthRestService'
import {getLogger} from '../utils/logger'

export class LearnerRecord {
	logger = getLogger('LearnerRecord')
	private _restService: OauthRestService

	constructor(config: OauthRestService) {
		this._restService = config
	}

	async createEvent(eventId: string) {
		try {
			return await this._restService.postRequest({
				url: '/event',
				data: {
					uid: eventId,
					status: 'Active',
				}
			})
		} catch (e) {
			throw new Error(`An error occurred when trying to create an event: ${e}`)
		}
	}

	async getCancellationReasons() {
		try {
			return await this._restService.get(`/event/cancellationReasons`)
		} catch (e) {
			throw new Error(`An error occurred when trying to get cancellation reasons: ${e}`)
		}
	}

	async getBookingCancellationReasons() {
		return await this._restService.get(`/event/booking/cancellationReasons`)
	}

	set restService(value: OauthRestService) {
		this._restService = value
	}
}
