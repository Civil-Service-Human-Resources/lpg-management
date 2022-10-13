import { LearnerRecord } from "..";
import { CsrsService } from "../../csrs/service/csrsService";
import { LearningCatalogue } from "../../learning-catalogue";
import { ApproveBookingActionWorker } from "./approveBookingActionWorker";
import { CancelBookingActionWorker } from "./cancelBookingActionWorker";
import { EventActionWorker } from "./eventActionWorker";
import { WorkerAction } from "./WorkerAction";

export class ActionWorkerService {
    constructor(private learningCatalogue: LearningCatalogue,
        private civilServantRegistry: CsrsService,
        private learnerRecordAPI: LearnerRecord
        ) {}

    private workers: Map<WorkerAction, EventActionWorker>

    init() {
        this.workers = new Map<WorkerAction, EventActionWorker>()
        this.workers.set(WorkerAction.APPROVED_BOOKING, new ApproveBookingActionWorker(this.learningCatalogue,
            this.civilServantRegistry,
            this.learnerRecordAPI))

        this.workers.set(WorkerAction.CANCEL_BOOKING, new CancelBookingActionWorker(this.learningCatalogue,
            this.civilServantRegistry,
            this.learnerRecordAPI))
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