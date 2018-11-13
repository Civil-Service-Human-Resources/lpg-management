import {OauthRestService} from '../lib/http/oauthRestService'
import {LearnerRecordConfig} from './learnerRecordConfig'
import {Auth} from '../identity/auth'
import {Invite} from './model/invite'
import {InviteFactory} from './model/factory/inviteFactory'
import {Booking} from './model/booking'
import {BookingFactory} from './model/factory/bookingFactory'

export class LearnerRecord {
	private _restService: OauthRestService
	private _inviteFactory: InviteFactory
	private _bookingFactory: BookingFactory

	constructor(config: LearnerRecordConfig, auth: Auth, inviteFactory: InviteFactory, bookingFactory: BookingFactory) {
		this._restService = new OauthRestService(config, auth)

		this._inviteFactory = inviteFactory
		this._bookingFactory = bookingFactory
	}

	async getEventInvitees(eventId: string) {
		const data = await this._restService.get(`/event/${eventId}/invitee`)

		const invites = (data || []).map(this._inviteFactory.create)
		return invites
	}

	async inviteLearner(eventId: string, invite: Invite) {
		return await this._restService.post(`/event/${eventId}/invitee`, invite)
	}

	async getEventBookings(eventId: string) {
		const data = await this._restService.get(`/event/${eventId}/booking`)
		const bookings = (data || []).map(this._bookingFactory.create)

		return bookings
	}

	async updateBooking(eventId: string, booking: Booking) {
		await this._restService.patch(`/event/${eventId}/booking/${booking.id}`, {status: booking.status})
	}

	set restService(value: OauthRestService) {
		this._restService = value
	}
}
