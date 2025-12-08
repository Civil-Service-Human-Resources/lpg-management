import {OauthRestService} from '../lib/http/oauthRestService'
import {Invite} from './model/invite'
import {InviteFactory} from './model/factory/inviteFactory'
import {BookingFactory} from './model/factory/bookingFactory'
import { getLogger } from '../utils/logger'

export class LearnerRecord {
	logger = getLogger('LearnerRecord')
	private _restService: OauthRestService
	private _inviteFactory: InviteFactory
	private _bookingFactory: BookingFactory

	constructor(config: OauthRestService, bookingFactory: BookingFactory, inviteFactory: InviteFactory) {
		this._restService = config
		this._bookingFactory = bookingFactory
		this._inviteFactory = inviteFactory
	}

	async getEventBookings(eventId: string) {
		try {
			const data = await this._restService.get(`/event/${eventId}/booking`)
			const bookings = (data || []).map(this._bookingFactory.create)

			return bookings
		} catch (e) {
			throw new Error(`An error occurred when trying to get event bookings: ${e}`)
		}
	}

	async getEventInvitees(eventId: string) {
		try {
			const data = await this._restService.get(`/event/${eventId}/invitee`)

			const invites = (data || []).map(this._inviteFactory.create)
			return invites
		} catch (e) {
			throw new Error(`An error occurred when trying to get event invitees: ${e}`)
		}
	}

	async inviteLearner(eventId: string, invite: Invite): Promise<Invite> {
		return await this._restService.post(`/event/${eventId}/invitee`, invite)
	}

	async createEvent(eventId: string, uri: string) {
		try {
			return await this._restService.post(`/event`, {
				uid: eventId,
				uri: uri,
				status: 'Active',
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
