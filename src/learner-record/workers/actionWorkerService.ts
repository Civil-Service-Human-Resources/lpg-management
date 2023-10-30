import { LearnerRecord } from "..";
import { CsrsService } from "../../csrs/service/csrsService";
import { OrganisationalUnitService } from "../../csrs/service/organisationalUnitService";
import { LearningCatalogue } from "../../learning-catalogue";
import { ApproveBookingActionWorker } from "./approveBookingActionWorker";
import { CancelBookingActionWorker } from "./cancelBookingActionWorker";
import { EventActionWorker } from "./eventActionWorker";
import { WorkerAction } from "./WorkerAction";
import {CslServiceClient} from '../../csl-service/client'

export class ActionWorkerService {
    constructor(private learningCatalogue: LearningCatalogue,
        private civilServantRegistry: CsrsService,
        private learnerRecordAPI: LearnerRecord,
        private organisationalUnitService: OrganisationalUnitService,
        private cslService: CslServiceClient
        ) {}

    private workers: Map<WorkerAction, EventActionWorker>

    init() {
        this.workers = new Map<WorkerAction, EventActionWorker>()
        this.workers.set(WorkerAction.APPROVED_BOOKING, new ApproveBookingActionWorker(this.learningCatalogue,
            this.civilServantRegistry,
            this.organisationalUnitService,
            this.learnerRecordAPI,
            this.cslService))

        this.workers.set(WorkerAction.CANCEL_BOOKING, new CancelBookingActionWorker(this.learningCatalogue,
            this.civilServantRegistry,
            this.organisationalUnitService,
            this.learnerRecordAPI,
            this.cslService))
    }

    getWorker(action: WorkerAction) {
        const worker = this.workers.get(action)
        if (worker) {
            return worker
        } else {
            throw new Error(`Action worker for action ${action.toString()} has not been mapped.`)
        }
    }
}
