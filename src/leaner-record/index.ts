import {OauthRestService} from '../lib/http/oauthRestService'
import {LearnerRecordConfig} from './learnerRecordConfig'
import {Auth} from '../identity/auth'
import {EventRecordFactory} from './model/factory/eventRecordFactory'

export class LearnerRecord {
	private _restService: OauthRestService
	private _eventRecordFactory: EventRecordFactory

	constructor(config: LearnerRecordConfig, auth: Auth, eventRecordFactory: EventRecordFactory) {
		this._restService = new OauthRestService(config, auth)

		this._eventRecordFactory = eventRecordFactory
	}

	async getEventRecord(eventId: string) {
		const data = await this._restService.get(/events/${eventId})

		let records = []

		for (const record of data) {
			records.push(this._eventRecordFactory.create(record))
		}

		return records
	}

	set restService(value: OauthRestService) {
		this._restService = value
	}
}
