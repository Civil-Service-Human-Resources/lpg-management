import {beforeEach, describe, it} from 'mocha'
import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {NextFunction, Request, Response} from 'express'
import * as sinon from 'sinon'
import {mockReq, mockRes} from 'sinon-express-mock'
import {SkillsController} from '../../../../src/controllers/skills/skillsController'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {QuestionFactory} from '../../../../src/controllers/skills/questionFactory'
import {QuizFactory} from '../../../../src/controllers/skills/quizFactory'
import {Validator} from "../../../../src/learning-catalogue/validator/validator"
import {Question} from "../../../../src/controllers/skills/question"
import {Quiz} from "../../../../src/controllers/skills/quiz"

chai.use(sinonChai)

describe('Skills Controller Tests', function() {
	let skillsController: SkillsController
	let csrsService: CsrsService
	let questionFactory: QuestionFactory
	let quizFactory: QuizFactory
	let req: Request
	let res: Response
	let validator: Validator<Question>
	let userRoles

	const next: NextFunction = sinon.stub()

	beforeEach(() => {
		csrsService = <CsrsService>{}
		questionFactory = <QuestionFactory>{}
		quizFactory = <QuizFactory>{}
		validator = <Validator<Question>>{}

		skillsController = new SkillsController(csrsService, questionFactory, quizFactory, validator)

		req = mockReq()
		res = mockRes()
		req.session!.save = callback => {
			callback(undefined)
		}

		userRoles = ["something"]

		req.user = new Object()
		req.user.roles = userRoles
	})

	describe('Skills Manage', () => {
		it('should render skills page', async () => {
			let mockCivilServant, mockQuiz, mockResults

			mockCivilServant= {
				"profession": {
					"id": 1,
					"name": "Analysis"
				},
				"organisationalUnit": {
					"id": 1
				}
			}

			mockQuiz = {
				"id": 1,
				"name": "Quiz for Analysis",
				"profession": {
					"id": 1,
					"name": "Analysis",
					"children": []
				},
				"questions": [],
				"status": "DRAFT",
				"numberOfQuestions": 0,
				"description": "This is a new sample description"
			}

			mockResults = {

			}

			const quiz: Quiz = new Quiz()
			csrsService.getCivilServant = sinon.stub().returns(Promise.resolve(mockCivilServant))
			csrsService.createQuizByProfessionID = sinon.stub().returns(Promise.resolve(mockQuiz))
			csrsService.getResultsByProfession = sinon.stub().returns(Promise.resolve(mockResults))
			quizFactory.create = sinon.stub().returns(quiz)
			await skillsController.getSkills()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/skills')
		})
	})

	describe('Add new question', () => {
		it('should render Add new question page', async () => {
			await skillsController.getAddQuestion()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/question')
		})
	})

	describe('Update question', () => {
		it('should render update question page', async () => {

			req.params.questionID = "2"

			let questsionDTO = new Object()

			let response = {
				"id": 1,
				"type": "MULTIPLE",
				"value": "What is the capital of Ireland?",
				"answer": {
					"id": 1,
					"correctAnswers": [
						"A",
						"D"
					],
					"answers": {
						"A": "Dublin",
						"B": "London",
						"C": "New York",
						"D": "Melbourne"
					}
				},
				"status": "ACTIVE"
			}

			csrsService.getQuestionbyID = sinon.stub().returns(Promise.resolve(response))
			questionFactory.create = sinon.stub().returns(questsionDTO)
			await skillsController.getEditQuestion()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/question')
		})

	})

	describe('Skills report', () => {
		it('should render Skills report page', async () => {
			let response = [
				{
					"name": "Analysis",
					"id": 1,
					"href": "http://localhost:9002/professions/1",
					"abbreviation": null,
					"formattedName": "Analysis"
				},
				{
					"name": "Commercial",
					"id": 2,
					"href": "http://localhost:9002/professions/2",
					"abbreviation": null,
					"formattedName": "Commercial"
				}]
			csrsService.getAreasOfWork = sinon.stub().returns(Promise.resolve(response))
			await skillsController.getSkillsReport()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/generate-report')
		})
	})

	describe('Archieve a quiz', () => {
		it('should render the archieve confirmation page for a quiz', async () => {
			await skillsController.getDeleteQuiz()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/delete-quiz')
		})

		it('should call delete a quiz', async () => {
			await skillsController.deleteQuiz()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/delete-quiz')
		})
	})

	describe('Archieve a question', () => {
		it('should render the archieve confirmation page for a question', async () => {
			await skillsController.getDeleteQuestion()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/delete-question')
		})

		it('should call delete a question', async () => {
			req.params.questionID = "2"
			req.body.deleteQuestion = 'True'
			csrsService.deleteQuestionbyID = sinon.stub().returns(Promise.resolve())
			await skillsController.deleteQuestion()(req, res, next)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/skills/delete-questions/success`)

		})
	})

	describe('Preview question', () => {
		it('should render the preview question page', async () => {
			req.params.questionID = "2"
			// let questsionDTO = new Object()
			let question = {
				"id": 1,
				"type": "MULTIPLE",
				"value": "What is the capital of Ireland?",
				"answer": {
					"id": 1,
					"correctAnswers": [
						"A",
						"D"
					],
					"answers": {
						A: "Dublin",
						B: "London",
						C: "New York",
						D: "Melbourne"
					}
				},
				"status": "ACTIVE"
			}

			csrsService.getQuestionbyID = sinon.stub().returns(Promise.resolve(question))
			questionFactory.create = sinon.stub().returns(question)
			await skillsController.previewQuestion()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/quiz-question')
		})
	})

	describe('Skills Description', () => {
		it('should render Description page', async () => {
			let mockCivilServant, mockQuiz
			mockCivilServant= {
				"profession": {
					"id": 1,
					"name": "Analysis"
				}
			}

			mockQuiz = {
				"id": 1,
				"name": "Quiz for Analysis",
				"profession": {
					"id": 1,
					"name": "Analysis",
					"children": []
				},
				"questions": [],
				"status": "DRAFT",
				"numberOfQuestions": 0,
				"description": "This is a new sample description"
			}

			csrsService.getCivilServant = sinon.stub().returns(Promise.resolve(mockCivilServant))
			csrsService.getQuizByProfession = sinon.stub().returns(Promise.resolve(mockQuiz))

			await skillsController.getEditQuitDescription()(req, res, next)
			expect(res.render).to.have.been.calledOnceWith('page/skills/edit-quiz-description')
		})
	})


})
