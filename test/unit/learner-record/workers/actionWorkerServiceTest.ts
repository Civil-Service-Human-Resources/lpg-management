import * as chai from 'chai';
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

import { CsrsService } from '../../../../src/csrs/service/csrsService';
import { LearnerRecord } from '../../../../src/learner-record';
import { ActionWorkerService } from '../../../../src/learner-record/workers/actionWorkerService';
import {
    CancelBookingActionWorker
} from '../../../../src/learner-record/workers/cancelBookingActionWorker';
import { WorkerAction } from '../../../../src/learner-record/workers/WorkerAction';
import { LearningCatalogue } from '../../../../src/learning-catalogue';

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Tests for actionWorkerService', () => {

    it('Should be able to fetch a worker when a worker type is passed in', () => {
        const learningCatalogue = <LearningCatalogue>{}
        const csrs = <CsrsService>{}
		const learnerRecordApi = <LearnerRecord>{}

        const service = new ActionWorkerService(learningCatalogue, csrs, learnerRecordApi)
        service.init()
        const worker = service.getWorker(WorkerAction.CANCEL_BOOKING)
        expect(worker).instanceOf(CancelBookingActionWorker)
    })
})