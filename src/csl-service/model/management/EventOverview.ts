import {BookingOverview} from './BookingOverview'
import {Venue} from '../../../learning-catalogue/model/venue'
import {Type} from 'class-transformer'

export class EventOverview {
	id: string
	@Type(() => Venue)
	venue: Venue
	dates: string[]
	status: string
	cancellationReason?: string
	moduleId: string
	moduleTitle: string
	courseId: string
	courseTitle: string
	courseStatus: string
	invitedEmails: string[]
	@Type(() => BookingOverview)
	bookings: BookingOverview[]

	getTitle() {
		return `${this.venue.location}, ${this.dates[0]}`
	}

	getCourseUrl() {
		return `/content-management/courses/${this.courseId}`
	}

	getBaseUrl() {
		return `${this.getCourseUrl()}/modules/${this.moduleId}/events/${this.id}`
	}

	getCourseOverviewUrl() {
		return `${this.getCourseUrl()}/overview`
	}

	getInviteUrl() {
		return `${this.getBaseUrl()}/invite`
	}

	getEditDateTimeUrl() {
		return `${this.getBaseUrl()}/dateRanges`
	}

	getEditLocationUrl() {
		return `${this.getBaseUrl()}/location`
	}

	getCancelUrl() {
		return `${this.getBaseUrl()}/cancel`
	}

	getBookingUrl(bookingId: string) {
		return `${this.getBaseUrl()}/attendee/${bookingId}`
	}
}
