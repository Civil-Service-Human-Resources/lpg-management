import moment = require("moment")
import { JsonPatch } from "../../../models/JsonPatch"
import { CourseRecordPreference } from "../courseRecord/courseRecord"
import { RecordState } from "../record"


export function clearState() {
	return JsonPatch.removePatch('state')
}

export function setState(state: RecordState) {
	return JsonPatch.replacePatch('state', state)
}

export function setLastUpdated(lastUpdated: Date = new Date()) {
	return JsonPatch.replacePatch('lastUpdated', moment(lastUpdated).format('YYYY-MM-DDTHH:mm:ss'))
}

export function setPreference(preference: CourseRecordPreference) {
	return JsonPatch.replacePatch('preference', preference)
}