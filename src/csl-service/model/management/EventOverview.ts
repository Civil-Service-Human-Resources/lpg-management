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
	courseStatus?: string
	invitedEmails: string[]
	@Type(() => BookingOverview)
	bookings: BookingOverview[]
}
