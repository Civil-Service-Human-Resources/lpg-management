import moment = require("moment");
import { Course } from "../../learning-catalogue/model/course";
import { Event } from "../../learning-catalogue/model/event";
import { Module } from "../../learning-catalogue/model/module";
import { CourseRecord } from "../model/courseRecord/courseRecord";
import { setLastUpdated, setState } from "../model/factory/courseRecordPatchFactory";
import { clearField, setEventDate, setEventId, setUpdatedAt } from "../model/factory/moduleRecordPatchFactory";
import { ModuleRecord } from "../model/moduleRecord/moduleRecord";
import { RecordState } from "../model/record";
import { EventActionWorker } from "./eventActionWorker";
import { WorkerAction } from "./WorkerAction";

export class ApproveBookingActionWorker extends EventActionWorker {

    async createCourseRecord(course: Course, module: Module, event: Event, userId: string): Promise<void> {
        const modRecord = this.generateModuleRecordInput(userId, course.id, module, event, RecordState.Approved)
        await this.createNewCourseRecord(course, userId, [modRecord], RecordState.Approved)
    }

    async createModuleRecord(userId: string, courseId: string, mod: Module, event: Event): Promise<ModuleRecord> {
        return await this.createNewModuleRecord(userId, courseId, mod, event, RecordState.Approved)
    }

    async updateCourseRecord(userId: string, courseRecord: CourseRecord): Promise<void> {
        const patches = [setLastUpdated(new Date())]
        if (courseRecord.isNull() || !courseRecord.isInProgress()) {
            patches.push(setState(RecordState.Approved))
        }
        await this.learnerRecordAPI.patchCourseRecord(patches, userId, courseRecord.courseId)
    }

    async updateModuleRecord(moduleRecord: ModuleRecord, event: Event): Promise<ModuleRecord> {
        const patches = [
            setState(RecordState.Approved),
            clearField('result'),
            clearField('score'),
            clearField('completionDate'),
            setEventId(event.id),
            setEventDate(moment(event.dateRanges[0].date).toDate()),
            setUpdatedAt(new Date())
        ]
        return await this.learnerRecordAPI.patchModuleRecord(patches, moduleRecord.id)
    }

    protected getType(): WorkerAction {
		return WorkerAction.APPROVED_BOOKING
	}
}