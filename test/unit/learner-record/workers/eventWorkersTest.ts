import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {CivilServant} from '../../../../src/csrs/model/civilServant'
import {OrganisationalUnit} from '../../../../src/csrs/model/organisationalUnit'

import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {OrganisationalUnitService} from '../../../../src/csrs/service/organisationalUnitService'
import {LearnerRecord} from '../../../../src/learner-record'
import {CourseRecord} from '../../../../src/learner-record/model/courseRecord/courseRecord'
import {CourseRecordInput} from '../../../../src/learner-record/model/courseRecord/courseRecordInput'
import {ModuleRecord} from '../../../../src/learner-record/model/moduleRecord/moduleRecord'
import {ModuleRecordInput} from '../../../../src/learner-record/model/moduleRecord/moduleRecordInput'
import {RecordState} from '../../../../src/learner-record/model/record'
import {ApproveBookingActionWorker} from '../../../../src/learner-record/workers/approveBookingActionWorker'
import { CancelBookingActionWorker } from '../../../../src/learner-record/workers/cancelBookingActionWorker'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {Audience} from '../../../../src/learning-catalogue/model/audience'
import {Course} from '../../../../src/learning-catalogue/model/course'
import {DateRange} from '../../../../src/learning-catalogue/model/dateRange'
import {Event} from '../../../../src/learning-catalogue/model/event'
import {FaceToFaceModule} from '../../../../src/learning-catalogue/model/faceToFaceModule'
import {JsonPatchInterface} from '../../../../src/models/JsonPatch'
import {CslServiceClient} from '../../../../src/csl-service/client'

chai.use(chaiAsPromised)
chai.use(sinonChai)

const testDate = new Date(2020, 0, 1, 0, 0, 0)
const testDateAsStr = '2020-01-01T00:00:00'

const testDepCode = '100'

const testUserID = 'USER001'
const testCourseID = 'course001'
const testCourseTitle = 'Course title'
const testModuleID = 'module001'
const testModuleRecordID = 1
const testEventID = 'event001'

// Mock course data

const testCourse = new Course()
testCourse.id = testCourseID
testCourse.title = testCourseTitle
const audience = new Audience()
audience.type = Audience.Type.REQUIRED_LEARNING
audience.departments = [testDepCode]
const testModule = new FaceToFaceModule()
testModule.id = testModuleID
testModule.title = 'Test module'
testModule.optional = false
testModule.duration = 100
testModule.cost = 10
const testDateRange = new DateRange()
testDateRange.date = testDateAsStr
const testEvent = new Event()
testEvent.id = testEventID
testEvent.dateRanges[0] = testDateRange

testModule.events = [testEvent]
testCourse.modules = [testModule]
testCourse.audiences = [audience]

const learningCatalogue = sinon.createStubInstance(LearningCatalogue)
learningCatalogue.getCourse.resolves(testCourse)

// Mock Civil servant data

const civilServant = new CivilServant()
const testOrg = new OrganisationalUnit()
testOrg.code = testDepCode
civilServant.fullName = 'Test User'
civilServant.organisationalUnit = testOrg

const civilServantRegistry = sinon.createStubInstance(CsrsService)
civilServantRegistry.getCivilServantWithUid.resolves(civilServant)

const organisationalUnitService = sinon.createStubInstance(OrganisationalUnitService)
organisationalUnitService.getOrgHierarchy.resolves([testOrg])

// Mock Learner Record data

const learnerRecordAPI = sinon.createStubInstance(LearnerRecord)
learnerRecordAPI.createCourseRecord.resolves()
learnerRecordAPI.createModuleRecord.resolves()
learnerRecordAPI.patchCourseRecord.resolves()
learnerRecordAPI.patchModuleRecord.resolves()

const cslService = sinon.createStubInstance(CslServiceClient)
cslService.clearCourseRecordCache.resolves()

const genericCourseRecord = (required: boolean, recordState?: RecordState) => {
	return new CourseRecord(testCourseID, testUserID, recordState, [], testCourseTitle, required)
}

const genericModuleRecord = () => {
	return new ModuleRecord(testModuleRecordID, testModuleID, testUserID, testCourseID, testDate, testDate, 'Module', 'link', undefined, 0, false)
}

const assertOneCallAndGetArgs = (stub: sinon.SinonStub) => {
	expect(stub.calledOnce, `Expected function ${stub} to be called once, was called ${stub.callCount} times`).to.be.true
	return stub.firstCall.args
}

const assertCreateCourseRecord = (expectedRequired: boolean, expectedCourseState: RecordState, expectedModuleState: RecordState, expectedPreference?: string) => {
	const args = assertOneCallAndGetArgs(learnerRecordAPI.createCourseRecord)
	const input = args[0] as CourseRecordInput
	expect(input.courseId).to.equal(testCourseID)
	expect(input.courseTitle).to.equal(testCourseTitle)
	expect(input.userId).to.equal(testUserID)
	expect(input.isRequired).to.equal(expectedRequired)
	expect(input.state).to.equal(expectedCourseState)
	expect(input.preference).to.equal(expectedPreference)
	const moduleInput = input.moduleRecords[0]
	expect(moduleInput.moduleId).to.equal(testModuleID)
	expect(moduleInput.state).to.equal(expectedModuleState)
	expect(moduleInput.eventDate).to.equal(testDateAsStr)
	expect(moduleInput.eventId).to.equal(testEventID)
}

const assertCreateModuleRecord = (expectedState: RecordState) => {
	const args = assertOneCallAndGetArgs(learnerRecordAPI.createModuleRecord)
	const input = args[0] as ModuleRecordInput
	expect(input.moduleId).to.equal(testModuleID)
	expect(input.eventId).to.equal(testEventID)
	expect(input.eventDate).to.equal(testDateAsStr)
	expect(input.state).to.equal(expectedState)
}

const assertJsonPatch = (patches: JsonPatchInterface[], expectedPatches: JsonPatchInterface[]) => {
	for (let i = 0; i < expectedPatches.length; i++) {
		const expPatch = expectedPatches[i]
		const actualPatch = patches[i]
		expect(actualPatch).to.eql(expPatch, `expected patch op to be ${JSON.stringify(expPatch)} but was ${JSON.stringify(actualPatch)}`)
	}
}

const assertPatchCourseRecord = (expectedPatches: JsonPatchInterface[]) => {
	const args = assertOneCallAndGetArgs(learnerRecordAPI.patchCourseRecord)
	const patches = args[0] as JsonPatchInterface[]
	const userId = args[1] as string
	const courseId = args[2] as string
	expect(courseId).to.equal(testCourseID)
	expect(userId).to.equal(testUserID)
	assertJsonPatch(patches, expectedPatches)
}

const assertPatchModuleRecord = (expectedPatches: JsonPatchInterface[]) => {
	const args = assertOneCallAndGetArgs(learnerRecordAPI.patchModuleRecord)
	const patches = args[0] as JsonPatchInterface[]
	const moduleRecordId = args[1] as number
	expect(moduleRecordId).to.equal(testModuleRecordID)
	assertJsonPatch(patches, expectedPatches)
}

describe('Tests for the event action workers', () => {
	beforeEach(() => {
		sinon.useFakeTimers(testDate.getTime())
	})

	afterEach(() => {
		learnerRecordAPI.createCourseRecord.reset()
		learnerRecordAPI.createModuleRecord.reset()
		learnerRecordAPI.patchCourseRecord.reset()
		learnerRecordAPI.patchModuleRecord.reset()
		cslService.clearCourseRecordCache.reset()
	})

	describe('Tests for the approve booking action worker', () => {
		let worker: ApproveBookingActionWorker

		beforeEach(() => {
			worker = new ApproveBookingActionWorker(learningCatalogue as any, civilServantRegistry as any,
                organisationalUnitService as any, learnerRecordAPI as any, cslService as any)
		})

		it('Should correctly create a course record', async () => {
			learnerRecordAPI.getCourseRecord.resolves(undefined)

			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertCreateCourseRecord(true, RecordState.Approved, RecordState.Approved)
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should correctly create a module record', async () => {
			learnerRecordAPI.getCourseRecord.resolves(genericCourseRecord(true, RecordState.InProgress))
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertCreateModuleRecord(RecordState.Approved)
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should correctly update the course record when the state is null', async () => {
			learnerRecordAPI.getCourseRecord.resolves(genericCourseRecord(true, RecordState.Null))
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertPatchCourseRecord([
				{op: 'replace', path: '/lastUpdated', value: testDateAsStr},
				{op: 'replace', path: '/state', value: 'APPROVED'},
			])
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should NOT update the course record when the state is in progress', async () => {
			learnerRecordAPI.getCourseRecord.resolves(genericCourseRecord(true, RecordState.InProgress))
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			expect(learnerRecordAPI.createCourseRecord.notCalled).to.be.true
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should correctly update the module record when the state is null', async () => {
			const courseRecord = genericCourseRecord(true, RecordState.Null)
			courseRecord.modules = [genericModuleRecord()]
			learnerRecordAPI.getCourseRecord.resolves(courseRecord)
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertPatchModuleRecord([
				{op: 'replace', path: '/state', value: 'APPROVED'},
				{op: 'remove', path: '/result', value: undefined},
				{op: 'remove', path: '/score', value: undefined},
				{op: 'remove', path: '/completionDate', value: undefined},
				{op: 'replace', path: '/eventId', value: testEventID},
				{op: 'replace', path: '/eventDate', value: testDateAsStr},
				{op: 'replace', path: '/updatedAt', value: testDateAsStr},
			])
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})
	})

	describe('Tests for the cancel booking action worker', () => {
		let worker: CancelBookingActionWorker

		beforeEach(() => {
			worker = new CancelBookingActionWorker(learningCatalogue as any, civilServantRegistry as any,
                organisationalUnitService as any, learnerRecordAPI as any, cslService as any)
		})
		it('Should correctly create a course record', async () => {
			learnerRecordAPI.getCourseRecord.resolves(undefined)
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertCreateCourseRecord(true, RecordState.Unregistered, RecordState.Unregistered)
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should correctly create a module record', async () => {
			learnerRecordAPI.getCourseRecord.resolves(genericCourseRecord(true, RecordState.InProgress))
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertCreateModuleRecord(RecordState.Unregistered)
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should correctly update the course record when the state is null', async () => {
			learnerRecordAPI.getCourseRecord.resolves(genericCourseRecord(true, RecordState.Null))
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertPatchCourseRecord([
				{op: 'replace', path: '/lastUpdated', value: testDateAsStr},
				{op: 'replace', path: '/state', value: 'UNREGISTERED'},
			])
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should NOT update the course record when the state is in progress', async () => {
			learnerRecordAPI.getCourseRecord.resolves(genericCourseRecord(true, RecordState.InProgress))
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			expect(learnerRecordAPI.createCourseRecord.notCalled).to.be.true
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})

		it('Should correctly update the module record when the state is null', async () => {
			const courseRecord = genericCourseRecord(true, RecordState.Null)
			courseRecord.modules = [genericModuleRecord()]
			learnerRecordAPI.getCourseRecord.resolves(courseRecord)
			await worker.applyActionToLearnerRecord(testUserID, testCourseID, testModuleID, testEventID)

			assertPatchModuleRecord([
				{op: 'replace', path: '/state', value: 'UNREGISTERED'},
				{op: 'remove', path: '/result', value: undefined},
				{op: 'remove', path: '/score', value: undefined},
				{op: 'remove', path: '/completionDate', value: undefined},
				{op: 'replace', path: '/updatedAt', value: testDateAsStr},
				{op: 'replace', path: '/bookingStatus', value: 'CANCELLED'},
			])
			assertOneCallAndGetArgs(cslService.clearCourseRecordCache)
		})
	})
})
