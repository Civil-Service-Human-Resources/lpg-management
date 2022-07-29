import { Course } from "../../learning-catalogue/model/course";
import { Event } from "../../learning-catalogue/model/event";
import { Module } from "../../learning-catalogue/model/module";
import { CourseRecord } from "../model/courseRecord/courseRecord";
import { setLastUpdated, setState } from "../model/factory/courseRecordPatchFactory";
import { clearField, setBookingStatus, setUpdatedAt } from "../model/factory/moduleRecordPatchFactory";
import { BookingStatus, ModuleRecord } from "../model/moduleRecord/moduleRecord";
import { RecordState } from "../model/record";
import { EventActionWorker } from "./eventActionWorker";

export class CancelBookingActionWorker extends EventActionWorker {

    async createCourseRecord(course: Course, module: Module, event: Event, userId: string): Promise<void> {
        const modRecord = this.generateModuleRecordInput(userId, course.id, module, event, RecordState.Unregsitered)
        await this.createNewCourseRecord(course, userId, [modRecord], RecordState.Unregsitered)
    }

    async createModuleRecord(userId: string, courseId: string, mod: Module, event: Event): Promise<ModuleRecord> {
        return await this.createNewModuleRecord(userId, courseId, mod, event, RecordState.Unregsitered)
    }

    async updateCourseRecord(userId: string, courseRecord: CourseRecord): Promise<void> {
        const patches = [setLastUpdated(new Date())]
        if (courseRecord.isNull() || courseRecord.isInProgress()) {
            patches.push(setState(RecordState.Unregsitered))
        }
        await this.learnerRecordAPI.patchCourseRecord(patches, userId, courseRecord.courseId)
    }

    async updateModuleRecord(moduleRecord: ModuleRecord, event: Event): Promise<ModuleRecord> {
        const patches = [
            setState(RecordState.Unregsitered),
            clearField('result'),
            clearField('score'),
            clearField('completionDate'),
            clearField('paymentMethod'),
            clearField('paymentDetails'),
            setUpdatedAt(new Date()),
            setBookingStatus(BookingStatus.Cancelled)
        ]
        return await this.learnerRecordAPI.patchModuleRecord(patches, moduleRecord.id)
    }
    
}