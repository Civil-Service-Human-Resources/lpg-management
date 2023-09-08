import { JsonPatch } from "../../../models/JsonPatch"
import { RecordState } from "../record"

export function setState(state: RecordState) {
	return JsonPatch.replacePatch('state', state)
}
