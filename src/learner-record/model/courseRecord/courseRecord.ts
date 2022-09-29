import { plainToClass } from 'class-transformer'
import { ModuleRecord } from "../moduleRecord/moduleRecord"
import { Record, RecordState } from "../record"


export enum CourseRecordPreference {
	Liked = 'LIKED',
	Disliked = 'DISLIKED'
}

export class CourseRecordResponse {
	courseRecords: CourseRecord[]

	constructor(courseRecords: CourseRecord[]) {
		this.courseRecords = courseRecords
	}
}

export class CourseRecord extends Record {
	courseTitle: string
	modules: ModuleRecord[] = []
	preference?: CourseRecordPreference
	lastUpdated?: Date
	courseDisplayState?: string
	required: boolean

	constructor(
		courseId: string,
		userId: string,
		state: RecordState = RecordState.Null,
		modules: ModuleRecord[] = [],
		courseTitle: string,
		required: boolean,
		preference?: CourseRecordPreference,
		lastUpdated?: Date
	) {
		super(courseId, userId, state)
		this.courseTitle = courseTitle
		this.preference = preference
		this.required = required
		if (lastUpdated) {
			this.lastUpdated = new Date(lastUpdated)
		}

		if (modules.length > 0) {
			this.fillRecords(modules)
		}
	}

	public updateModuleRecord(moduleRecordId: number, moduleRecord: ModuleRecord) {
		const existingModuleIndex = this.modules.findIndex(m => m.id === moduleRecordId)
		this.modules[existingModuleIndex] = moduleRecord
	}

	public hasBeenAddedToLearningPlan() {
		return this.isNull()
	}

	public hasBeenRemovedFromLearningPlan() {
		return this.isArchived()
	}

	public getModuleRecord = (moduleId: string) => {
		return this.modules.find(m => m.moduleId === moduleId)
	}

	private fillRecords = (moduleRecords: ModuleRecord[]) => {
		this.modules = moduleRecords.map(m => plainToClass(ModuleRecord, m as ModuleRecord))
	}

}
