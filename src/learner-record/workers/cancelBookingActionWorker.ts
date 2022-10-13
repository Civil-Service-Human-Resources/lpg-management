import { Course } from "../../learning-catalogue/model/course";
import { Event } from "../../learning-catalogue/model/event";
import { Module } from "../../learning-catalogue/model/module";
import { CourseRecord } from "../model/courseRecord/courseRecord";
import { setLastUpdated, setState } from "../model/factory/courseRecordPatchFactory";
import { clearField, setBookingStatus, setUpdatedAt } from "../model/factory/moduleRecordPatchFactory";
import { BookingStatus, ModuleRecord } from "../model/moduleRecord/moduleRecord";
import { RecordState } from "../model/record";
import { EventActionWorker } from "./eventActionWorker";
import { WorkerAction } from "./WorkerAction";

export class CancelBookingActionWorker extends EventActionWorker {

    async createCourseRecord(course: Course, module: Module, event: Event, userId: string): Promise<void> {
        const modRecord = this.generateModuleRecordInput(userId, course.id, module, event, RecordState.Unregistered)
        await this.createNewCourseRecord(course, userId, [modRecord], RecordState.Unregistered)
    }

    async createModuleRecord(userId: string, courseId: string, mod: Module, event: Event): Promise<ModuleRecord> {
        return await this.createNewModuleRecord(userId, courseId, mod, event, RecordState.Unregistered)
    }

    async updateCourseRecord(userId: string, courseRecord: CourseRecord): Promise<void> {
        const patches = [setLastUpdated(new Date())]
        if (courseRecord.isNull() || !courseRecord.isInProgress()) {
            patches.push(setState(RecordState.Unregistered))
        }
        await this.learnerRecordAPI.patchCourseRecord(patches, userId, courseRecord.courseId)
    }

    async updateModuleRecord(moduleRecord: ModuleRecord, event: Event): Promise<ModuleRecord> {
        const patches = [
            setState(RecordState.Unregistered),
            clearField('result'),
            clearField('score'),
            clearField('completionDate'),
            setUpdatedAt(new Date()),
            setBookingStatus(BookingStatus.CANCELLED)
        ]
        return await this.learnerRecordAPI.patchModuleRecord(patches, moduleRecord.id)
    }

    protected getType(): WorkerAction {
		return WorkerAction.CANCEL_BOOKING
	}
    
}