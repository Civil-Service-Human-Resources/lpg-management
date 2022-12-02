import { LearnerRecord } from "..";
import { CsrsService } from "../../csrs/service/csrsService";
import { LearningCatalogue } from "../../learning-catalogue";
import { Course } from "../../learning-catalogue/model/course";
import { Event } from "../../learning-catalogue/model/event";
import { FaceToFaceModule } from "../../learning-catalogue/model/faceToFaceModule";
import { Module } from "../../learning-catalogue/model/module";
import { ModuleNotFoundError } from "../../lib/exception/moduleNotFound";
import { EventNotFoundError } from "../../lib/exception/eventNotFound";
import { getLogger } from "../../utils/logger";
import { CourseRecord } from "../model/courseRecord/courseRecord";
import { CourseRecordInput } from "../model/courseRecord/courseRecordInput";
import { ModuleRecord } from "../model/moduleRecord/moduleRecord";
import { ModuleRecordInput } from "../model/moduleRecord/moduleRecordInput";
import { RecordState } from "../model/record";
import { WorkerAction } from "./WorkerAction";
import { CivilServant } from "../../csrs/model/civilServant";
import { OrganisationalUnitService } from "../../csrs/service/organisationalUnitService";


export abstract class EventActionWorker {

    private logger = getLogger('EventActionWorker')
    
    constructor(protected learningCatalogue: LearningCatalogue,
        protected civilServantRegistry: CsrsService,
        protected organisationalUnitService: OrganisationalUnitService,
        protected learnerRecordAPI: LearnerRecord
        ) {}

    async applyActionToLearnerRecord(userId: string, courseId: string, moduleId: string, eventId: string) {
        try {
            this.logger.debug(`Applying action to module ${moduleId} for course ${courseId} and user ${userId}`)
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
                this.logger.debug(`Creating course record`)
                await this.createCourseRecord(course, module, event, userId)
            } else {
                const moduleRecord = courseRecord.getModuleRecord(moduleId)
                if (!moduleRecord) {
                    this.logger.debug(`Creating module record`)
                    await this.createModuleRecord(userId, courseId, module, event)
                } else {
                    this.logger.debug(`Updating module record`)
                    await this.updateModuleRecord(moduleRecord, event)
                }
                this.logger.debug(`Updating course record`)
                await this.updateCourseRecord(userId, courseRecord)
            }
        } catch (e) {
            this.logger.error(`Failed to apply action to the course record. UserID: ${userId}, ` +
            `CourseID: ${courseId}, ModuleID: ${moduleId}, type: ${this.getType()}. Error: ${e}`)
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
        const civilServant: CivilServant = await this.civilServantRegistry.getCivilServantWithUid(userId)
        if (civilServant) {
            if (civilServant.organisationalUnit.code) {
                const orgHierarchy = await this.organisationalUnitService.getOrgHierarchy(civilServant.organisationalUnit.id)
                const orgCodes = orgHierarchy.map(o => o.code)
                required = course.isCourseRequiredForDepartments(orgCodes)
            }
        }
        return required;
    }

    abstract createCourseRecord(course: Course, module: Module, event: Event, userId: string): Promise<void>
    abstract createModuleRecord(userId: string, courseId: string, mod: Module, event: Event): Promise<ModuleRecord>
    abstract updateCourseRecord(userId: string, courseRecord: CourseRecord): Promise<void>
    abstract updateModuleRecord(moduleRecord: ModuleRecord, event: Event): Promise<ModuleRecord>
    protected abstract getType(): WorkerAction
}