import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinonChai from 'sinon-chai'

import { CsrsService } from '../../../../src/csrs/service/csrsService';
import { OrganisationalUnitService } from '../../../../src/csrs/service/organisationalUnitService';
import { LearnerRecord } from '../../../../src/learner-record';
import { ActionWorkerService } from '../../../../src/learner-record/workers/actionWorkerService';
import {
    CancelBookingActionWorker
} from '../../../../src/learner-record/workers/cancelBookingActionWorker';
import { WorkerAction } from '../../../../src/learner-record/workers/WorkerAction';
import { LearningCatalogue } from '../../../../src/learning-catalogue';
import {CslServiceClient} from '../../../../src/csl-service/client';

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Tests for actionWorkerService', () => {

    it('Should be able to fetch a worker when a worker type is passed in', () => {
        const learningCatalogue = <LearningCatalogue>{}
        const csrs = <CsrsService>{}
		const learnerRecordApi = <LearnerRecord>{}
        const organisationalUnitService = <OrganisationalUnitService>{}
        const cslService = <CslServiceClient>{}

        const service = new ActionWorkerService(learningCatalogue, csrs, learnerRecordApi, organisationalUnitService, cslService)
        service.init()
        const worker = service.getWorker(WorkerAction.CANCEL_BOOKING)
        expect(worker).instanceOf(CancelBookingActionWorker)
    })
})
