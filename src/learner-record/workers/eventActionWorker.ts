import { LearnerRecord } from "..";
import { CsrsService } from "../../csrs/service/csrsService";
import { LearningCatalogue } from "../../learning-catalogue";
import { Course } from "../../learning-catalogue/model/course";
import { Event } from "../../learning-catalogue/model/event";
import { FaceToFaceModule } from "../../learning-catalogue/model/faceToFaceModule";
import { Module } from "../../learning-catalogue/model/module";
import { ModuleNotFoundError } from "../../lib/exception/moduleNotFound";
import { EventNotFoundError } from "../../lib/exception/moduleNotFound copy";
import { getLogger } from "../../utils/logger";
import { CourseRecord } from "../model/courseRecord/courseRecord";
import { CourseRecordInput } from "../model/courseRecord/courseRecordInput";
import { ModuleRecord } from "../model/moduleRecord/moduleRecord";
import { ModuleRecordInput } from "../model/moduleRecord/moduleRecordInput";
import { RecordState } from "../model/record";


export abstract class EventActionWorker {

    private logger = getLogger('EventActionWorker')
    
    constructor(protected learningCatalogue: LearningCatalogue,
        protected civilServantRegistry: CsrsService,
        protected learnerRecordAPI: LearnerRecord
        ) {}

    async applyActionToLearnerRecord(userId: string, courseId: string, moduleId: string, eventId: string) {
        try {
            const course: Course = await this.learningCatalogue.getCourse(courseId)
            const module = course.getModule(moduleId)
            if (!module) {
                throw new ModuleNotFoundError(courseId, moduleId)
            }
            const f2fModule = <FaceToFaceModule>module
            const event = f2fModule.getEvent(eventId)
            if (!event) {
                throw new EventNotFoundError(courseId, moduleId, eventId)
            }
            
            const courseRecord = await this.learnerRecordAPI.getCourseRecord(courseId, userId)
            if (!courseRecord) {
                this.logger.debug(`Creating course record ${courseId} for user ${userId}`)
                await this.createCourseRecord(course, module, event, userId)
            } else {
                const moduleRecord = courseRecord.getModuleRecord(moduleId)
                if (!moduleRecord) {
                    this.logger.debug(`Creating module record ${moduleId} for course ${courseId} and user ${userId}`)
                    await this.createModuleRecord(userId, courseId, module, event)
                } else {
                    this.logger.debug(`Updating module record ${moduleId} for course ${courseId} and user ${userId}`)
                    await this.updateModuleRecord(moduleRecord, event)
                }
                this.logger.debug(`Updating course record for course ${courseId} and user ${userId}`)
                await this.updateCourseRecord(userId, courseRecord)
            }
        } catch (e) {
            this.logger.error(`Failed to apply action to the course record. UserID: ${userId}, ` +
            `CourseID: ${courseId}, ModuleID: ${moduleId}. Error: ${e}`)
            throw e
        }
    }

    protected generateModuleRecordInput(userId: string, courseId: string, mod: Module, event: Event, state: RecordState) {
        const eventDate = event.dateRanges[0].date
        return new ModuleRecordInput(userId, courseId, mod.id, mod.title, mod.optional,
                                    mod.type, mod.duration, state, mod.cost, event.id, eventDate)
    }

    protected createNewCourseRecord = async (course: Course, userId: string, moduleRecords: ModuleRecordInput[], state?: RecordState, preference?: string) => {
        const required = await this.isCourseRequired(course, userId)
        const input = new CourseRecordInput(course.id, course.title, userId, required, moduleRecords, state, preference)
        await this.learnerRecordAPI.createCourseRecord(input)
    }

    protected createNewModuleRecord = async (userId: string, courseId: string, mod: Module, event: Event, state: RecordState) => {
        const input = this.generateModuleRecordInput(userId, courseId, mod, event, state)
        return await this.learnerRecordAPI.createModuleRecord(input)
    }

    private async isCourseRequired(course: Course, userId: string) {
        let required = false
        const civilServant = await this.civilServantRegistry.getCivilServantWithUid(userId)
        if (civilServant) {
            if (civilServant.organisationalUnit.code) {
                const orgs = await this.civilServantRegistry.getOrganisation(civilServant.organisationalUnit.code)
                const orgCodes = orgs.map(o => o.code)
                console.log(orgCodes)
                required = course.isCourseRequiredForDepartments(orgCodes)
            }
        }
        console.log(required)
        return required;
    }

    abstract createCourseRecord(course: Course, module: Module, event: Event, userId: string): Promise<void>
    abstract createModuleRecord(userId: string, courseId: string, mod: Module, event: Event): Promise<ModuleRecord>
    abstract updateCourseRecord(userId: string, courseRecord: CourseRecord): Promise<void>
    abstract updateModuleRecord(moduleRecord: ModuleRecord, event: Event): Promise<ModuleRecord>
}