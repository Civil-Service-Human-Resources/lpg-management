import {OauthRestService} from '../lib/http/oauthRestService'
import {LearnerRecordConfig} from './learnerRecordConfig'
import {Auth} from '../identity/auth'
import {Invite} from './model/invite'
import {InviteFactory} from './model/factory/inviteFactory'
import {Booking} from './model/booking'
import {BookingFactory} from './model/factory/bookingFactory'
import {Event} from '../learning-catalogue/model/event'

export class LearnerRecord {
	private _restService: OauthRestService
	private _inviteFactory: InviteFactory
	private _bookingFactory: BookingFactory

	constructor(config: LearnerRecordConfig, auth: Auth, bookingFactory: BookingFactory, inviteFactory: InviteFactory) {
		this._restService = new OauthRestService(config, auth)

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

	async updateBooking(eventId: string, booking: Booking) {
		try {
			await this._restService.patch(`/event/${eventId}/booking/${booking.id}`, {
				status: booking.status,
				cancellationReason: booking.cancellationReason,
			})
		} catch (e) {
			throw new Error(`An error occurred when trying to update booking: ${e}`)
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

	async cancelEvent(eventId: string, event: Event, cancellationReason: String) {
		try {
			return await this._restService.patch(`/event/${eventId}`, {
				status: event.status,
				cancellationReason: cancellationReason,
			})
		} catch (e) {
			throw new Error(`An error occurred when trying to cancel an event: ${e}`)
		}
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

	set restService(value: OauthRestService) {
		this._restService = value
	}
}
