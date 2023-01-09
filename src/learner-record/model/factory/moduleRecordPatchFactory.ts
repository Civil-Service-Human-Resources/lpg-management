import moment = require("moment")
import { JsonPatch } from "../../../models/JsonPatch"
import { BookingStatus, ModuleRecordResult } from "../moduleRecord/moduleRecord"

export function clearField(field: string) {
	return JsonPatch.removePatch(field)
}

export function setScore(score: string) {
	return JsonPatch.replacePatch('score', score)
}

export function setRated(rated: boolean) {
	return JsonPatch.replacePatch('rated', rated.toString())
}

export function setResult(result: ModuleRecordResult) {
	return JsonPatch.replacePatch('result', result)
}

function setDate(key: string, date?: Date) {
	let convertedDate = undefined
	if (date) {
		convertedDate = moment(date).format('YYYY-MM-DDTHH:mm:ss')
	}
	return JsonPatch.replacePatch(key, convertedDate)
}

export function setUpdatedAt(updatedAt: Date) {
	return setDate('updatedAt', updatedAt)
}

export function setBookingStatus(status: BookingStatus) {
	return JsonPatch.replacePatch('bookingStatus', status.toString())
}

export function setCompletionDate(completionDate: Date) {
	return setDate('completionDate', completionDate)
}

export function setEventId(eventId: string) {
	return JsonPatch.replacePatch('eventId', eventId)
}

export function setEventDate(eventDate: Date) {
	return setDate('eventDate', eventDate)
}
