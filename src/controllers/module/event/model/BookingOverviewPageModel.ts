import {EventOverview} from '../../../../csl-service/model/management/EventOverview'

export class BookingOverviewPageModel {
	id: number;
	courseId: string;
	moduleId: string;
	eventId: string;
	title: string;
	moduleTitle: string;
	courseTitle: string;
	courseStatus: string;

	reference: string;
	learnerEmail: string;
	status: string;
	poNumber?: string;

	constructor(id: number, courseId: string, moduleId: string, eventId: string, title: string, moduleTitle: string,
				courseTitle: string, courseStatus: string, reference: string, learnerEmail: string, status: string,
				poNumber?: string) {
		this.id = id
		this.courseId = courseId
		this.moduleId = moduleId
		this.eventId = eventId
		this.title = title
		this.moduleTitle = moduleTitle
		this.courseTitle = courseTitle
		this.courseStatus = courseStatus
		this.reference = reference
		this.learnerEmail = learnerEmail
		this.status = status
		this.poNumber = poNumber
	}

	static fromEventOverview(eventOverview: EventOverview, bookingId: number) {
		let overview: BookingOverviewPageModel | undefined
		const booking = (eventOverview.bookings || []).find(b => b.id === bookingId)
		if (booking) {
			overview = new BookingOverviewPageModel(bookingId, eventOverview.courseId, eventOverview.moduleId,
				eventOverview.id, eventOverview.getTitle(), eventOverview.moduleTitle, eventOverview.courseTitle,
				eventOverview.courseStatus, booking.reference, booking.learnerEmail, booking.status, booking.poNumber)
		}
		return overview
	}

	getUrl() {
		return `/content-management/courses/${this.courseId}/modules/${this.moduleId}/events/${this.eventId}/attendee/${this.id}`
	}

	getBackLink() {
		return `/content-management/courses/${this.courseId}/modules/${this.moduleId}/events-overview/${this.eventId}`
	}

	getChangeToBookedLink() {
		return `${this.getUrl()}/update`
	}

	getCancelLink() {
		return `${this.getUrl()}/cancel`
	}
}