import {OauthRestService} from '../lib/http/oauthRestService'
import {LearnerRecordConfig} from './learnerRecordConfig'
import {Auth} from '../identity/auth'
import {Invite} from './model/invite'
import {InviteFactory} from './model/factory/inviteFactory'
import {Booking} from './model/booking'
import {BookingFactory} from './model/factory/bookingFactory'
import {Event} from '../learning-catalogue/model/event'
import { getLogger } from '../utils/logger'
import { CourseRecord, CourseRecordResponse } from './model/courseRecord/courseRecord'
import { plainToInstance } from 'class-transformer'
import { CourseRecordInput } from './model/courseRecord/courseRecordInput'
import { JsonPatch } from '../models/JsonPatch'
import { ModuleRecordInput } from './model/moduleRecord/moduleRecordInput'
import { ModuleRecord } from './model/moduleRecord/moduleRecord'

export class LearnerRecord {
	logger = getLogger('LearnerRecord')
	private _restService: OauthRestService
	private _inviteFactory: InviteFactory
	private _bookingFactory: BookingFactory

	constructor(config: LearnerRecordConfig, auth: Auth, bookingFactory: BookingFactory, inviteFactory: InviteFactory) {
		this._restService = new OauthRestService(config, auth)

		this._bookingFactory = bookingFactory
		this._inviteFactory = inviteFactory
	}

	async patchModuleRecord(jsonPatch: JsonPatch[], moduleRecordId: number) {
		try {
			this.logger.debug(`Patching module record with ID ${moduleRecordId}`)
			const res: ModuleRecord = await this._restService.patchWithJsonPatch(`/module_records/${moduleRecordId}`, jsonPatch)
			return plainToInstance(ModuleRecord, res)
		} catch (e) {
			throw new Error(`An error occurred when trying to patch the module record: ${e}`)
		}
	}

	async createModuleRecord(moduleRecord: ModuleRecordInput): Promise<ModuleRecord> {
		try {
			this.logger.debug(`Creating module record for module ID ${moduleRecord.moduleId} and user ID ${moduleRecord.userId}`)
			const res: ModuleRecord = await this._restService.post('/module_records', moduleRecord)
			return plainToInstance(ModuleRecord, res)
		} catch (e) {
			throw new Error(`An error occurred when trying to create the module record: ${e}`)
		}
	}

	async patchCourseRecord(jsonPatch: JsonPatch[], userId: string, courseId: string) {
		try {
			this.logger.debug(`Patching course record for course ID ${courseId} and user ID ${userId}`)
			const res: CourseRecord = await this._restService.patchWithJsonPatch(`/course_records?courseId=${courseId}&userId=${userId}`, jsonPatch)
			return plainToInstance(CourseRecord, res)
		} catch (e) {
			throw new Error(`An error occurred when trying to patch the course record: ${e}`)
		}
	}

	async createCourseRecord(courseRecord: CourseRecordInput) {
		try {
			this.logger.debug(`Creating course record for course ID ${courseRecord.courseId}`)
			const res: CourseRecord = await this._restService.post('/course_records', courseRecord)
			return plainToInstance(CourseRecord, res)
		} catch (e) {
			throw new Error(`An error occurred when trying to create the course record: ${e}`)
		}
	}

	async getCourseRecord(courseId: string, userId: string): Promise<CourseRecord|undefined> {
		try {
			this.logger.debug(`Getting course record for course ID ${courseId} and user ID ${userId}`)
			const data: CourseRecordResponse = await this._restService.get(`/course_records?courseIds=${courseId}&userId=${userId}`)
			const courseRecords = plainToInstance(CourseRecordResponse, data).courseRecords
			if (courseRecords.length > 1) {
				this.logger.warn(`Course record for course ID ${courseId} and user ID ${userId} returned a result set greater than 1`)
			}
			return this.buildCourseRecord(courseRecords[0])
		} catch (e) {
			throw new Error(`An error occurred when trying to get the course record: ${e}`)
		}
	}

	async buildCourseRecord(courseRecordData: CourseRecord|undefined) {
		const courseRecord = plainToInstance(CourseRecord, courseRecordData)
		if (courseRecord !== undefined) {
			courseRecord.modules = courseRecord.modules.map(m => plainToInstance(ModuleRecord, m))
		}
		return courseRecord
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
