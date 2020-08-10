import {NextFunction, Request, Response, Router} from 'express'
import {CsrsService} from '../../csrs/service/csrsService'
import {PlaceholderDateSkills} from '../../learning-catalogue/model/placeholderDateSkills'
import {FormController} from '../formController'
import {Validator} from '../../learning-catalogue/validator/validator'
 import {QuestionFactory} from './questionFactory'
import {QuizFactory} from './quizFactory'
import {Question} from "./question"
import {Profession} from "./profession"
import {Answer} from "./answer"
import * as config from "../../config"
import { IsAnswersValid } from '../../learning-catalogue/validator/custom/quizQuestionAnswersValidator'
import moment = require('moment')

export class SkillsController implements FormController {
	csrsService: CsrsService
	validator: Validator<Question>
	router: Router
	questionFactory: QuestionFactory
	quizFactory: QuizFactory

	constructor(csrsService: CsrsService, questionFactory: QuestionFactory, quizFactory: QuizFactory, questionValidator: Validator<Question>) {
		this.router = Router()
		this.csrsService = csrsService
		this.validator = questionValidator
		this.questionFactory = questionFactory
		this.quizFactory = quizFactory
		this.configureRouterPaths()
	}

	private configureRouterPaths() {
		this.router.get('/content-management/skills', this.getSkills())
		this.router.get('/content-management/skills/add-new-question/success', this.getSkills())
		this.router.get('/content-management/skills/update-question/success', this.getSkills())
		this.router.get('/content-management/skills/generate-report', this.getSkillsReport())
		this.router.post('/content-management/skills/generate-report', this.generateReport())
		this.router.get('/content-management/skills/add-new-question', this.getAddQuestion())
		this.router.post('/content-management/skills/add-new-question', this.AddQuestion())
		this.router.get('/content-management/skills/delete-quiz', this.getDeleteQuiz())
		this.router.post('/content-management/skills/delete-quiz', this.deleteQuiz())
		this.router.get('/content-management/skills/edit-quiz-description', this.getEditQuizDescription())
		this.router.get('/content-management/skills/edit-quiz-description/success', this.getSkills())
		this.router.post('/content-management/skills/edit-quiz-description', this.editQuizDescription())
		this.router.get('/content-management/skills/:questionID/edit-question', this.getEditQuestion())
		this.router.post('/content-management/skills/:questionID/edit-question', this.EditQuestion())
		this.router.get('/content-management/skills/:questionID/delete-question', this.getDeleteQuestion())
		this.router.get('/content-management/skills/:questionID/delete-question/failed', this.getDeleteQuestion())
		this.router.post('/content-management/skills/:questionID/delete-question', this.deleteQuestion())
		this.router.post('/content-management/skills/publish-quiz', this.publishSkills())
		this.router.get('/content-management/skills/publish-quiz/success', this.getSkills())
		this.router.get('/content-management/skills/publish-quiz/failure', this.getSkills())
		this.router.get('/content-management/skills/super-admin', this.getSkillsSuperAdmin())
		this.router.get('/content-management/skills/organisation-admin', this.getSkillsOrgAdmin())
		this.router.get('/content-management/skills/delete-questions/success', this.getSkills())
		this.router.get('/content-management/skills/:questionID/preview', this.previewQuestion())
	}

		getSkillsSuperAdmin() {
		return async (req: Request, res: Response, next: NextFunction) => {

			let quizzes: any = null

			await this.csrsService
				.getAllQuizResults(req.user)
				.then(response => {
					quizzes = response
				})
				.catch(error => {
					next(error)
				})

			req.session!.save(() => {
				res.render('page/skills/skills-super-admin', {quizzes: quizzes})
			})
		}
	}

	getSkillsOrgAdmin() {
		return async (req: Request, res: Response, next: NextFunction) => {

			let quizzes: any = null
			let organisationalID: any = null

			await this.csrsService
				.getCivilServant()
				.then(civilServant => {
					if (civilServant.organisationalUnit) {
						organisationalID = civilServant.organisationalUnit.id
					}
				})
				.catch(error => {
					next(error)
				})

			await this.csrsService
				.getQuizesByOrg(organisationalID, req.user)
				.then(response => {
					quizzes = response
				})
				.catch(error => {
					next(error)
				})

			req.session!.save(() => {
				res.render('page/skills/skills-super-admin', {quizzes: quizzes})
			})

		}
	}

	previewQuestion() {
			return async (req: Request, res: Response, next: NextFunction) => {
				const questionID = req.params.questionID
				await this.csrsService
				.getQuestionbyID(questionID, req.user)
				.then( response => {
					const question = this.questionFactory.create(response)
					const answers = Object.values(question.answer.answers)
					const keys = ['A','B','C','D','E']
					req.session!.save(() => {
						res.render(`page/skills/quiz-question`, {
							question: question,
							answers: answers,
							keys: keys,
						})
					})
				})
				.catch(error => {
					next(error)
				})
		}
	}

	publishSkills() {
		return async (req: Request, res: Response, next: NextFunction) => {

			let profession = new Profession()

			await this.csrsService
				.getCivilServant()
				.then(civilServant => {
					if (civilServant.profession) {
						profession.id = civilServant.profession.id
					}
				})
				.catch(error => {
					next(error)
				})

			let data = {profession}

			await this.csrsService
				.publishSkills(data, req.user)
				.then(() => {
					req.session!.save(() => {
						res.redirect(`/content-management/skills/publish-quiz/success`)
					})
				})
				.catch(error => {
					res.redirect(`/content-management/skills/publish-quiz/failure`)
				})
		}
	}

	editQuizDescription() {
		return async (req: Request, res: Response, next: NextFunction) => {
			let professionID: any = null
			let description: any = req.body.description
		await this.csrsService
			.getCivilServant()
			.then(civilServant => {
				if (civilServant.profession) {
					professionID = civilServant.profession.id
				}
			})
			.catch(error => {
				next(error)
			})

		let profession = new Profession();
		profession.id = professionID

		let data = {profession, description: description}

		await this.csrsService
			.editDescription(data, req.user)
			.then(() => {
				req.session!.save(() => {
					res.redirect(`/content-management/skills/edit-quiz-description/success`)
				})
			})
			.catch(error => {
				next(error)
			})
		}
	}


	AddQuestion() {
		return async (req: Request, res: Response, next: NextFunction) => {
			let answer = new Answer()
			answer.answers = req.body.answers
			answer.correctAnswers = req.body.correctAnswers

			let data = {
				"value" : req.body.value,
				"answer": answer,
				"why" : req.body.why,
				'theme': req.body.theme,
				'learningName': req.body.learningName,
				'learningReference': req.body.learningReference,
			}

			let errors = await this.validator.check(data)

			const answerErrors = IsAnswersValid(answer)
			if (req.body.alternativeText == "" && req.body.mediaId != "") {
				let alternativeTextArray = new Array('skills.validation.alternativeText.empty')
				let alternativeText: any = { alternativeTextArray }
				answerErrors.push(alternativeText)
			}
			let newErrors: any = null
			// @ts-ignore
			answerErrors.forEach(function(errorAnswer: any) {
				newErrors = Object.assign(errors.fields, errorAnswer);
			});

			var errorCounter = 0, key;

			if (newErrors) {
				errors.fields = newErrors
				for (key in errors.fields) {
					if (errors.fields.hasOwnProperty(key)) errorCounter++;
				}
				let errorSize = {size : errorCounter}
				errors = Object.assign(errors, errorSize);
			}

			if (errors.size) {
				req.session!.sessionFlash = {
					errors,
					form: req.body,
				}
				return req.session!.save(() => {
					res.redirect('/content-management/skills/add-new-question')
				})
			} else {
				const question = this.questionFactory.create(req.body)
				let professionID: any = null
				await this.csrsService
					.getCivilServant()
					.then(civilServant => {
						if (civilServant.profession) {
							professionID = civilServant.profession.id
						}
					})
					.catch(error => {
						next(error)
					})

				let data = {professionId : professionID, question}

				await this.csrsService
					.postQuestion(data, req.user)
					.then(() => {
						res.redirect('/content-management/skills/add-new-question/success')
					})
					.catch(error => {
						next(error)
					})
			}

		}
	}

	deleteQuiz() {
		return async (req: Request, res: Response, next: NextFunction) => {
			let professionID: any = null

			if (req.body.deleteQuiz == 'True') {
				await this.csrsService
					.getCivilServant()
					.then(civilServant => {
						if (civilServant.profession) {
							professionID = civilServant.profession.id
						}
					})
					.catch(error => {
						next(error)
					})

				await this.csrsService
					.deleteQuizByProfession(professionID, req.user)
					.then(() => {
						req.session!.save(() => {
							res.redirect(`/content-management`)
						})
					})
					.catch(error => {
						next(error)
					})
			} else if (req.body.deleteQuiz == 'False')  {
				req.session!.save(() => {
					res.redirect(`/content-management/skills`)
				})
			} else {
				req.session!.save(() => {
					res.render('page/skills/delete-quiz', {
						error: 'You must select an option below to continue',
					})
				})
			}
		}
	}

	deleteQuestion() {

		return async (req: Request, res: Response, next: NextFunction) => {

			if (req.body.deleteQuestion == 'True') {
				await this.csrsService
					.deleteQuestionbyID(req.params.questionID, req.user)
					.then(() => {
						req.session!.save(() => {
							res.redirect(`/content-management/skills/delete-questions/success`)
						})
					})
					.catch(error => {
						next(error)
					})
			} else if (req.body.deleteQuestion == 'False')  {
				req.session!.save(() => {
					res.redirect(`/content-management/skills/${req.params.questionID}/edit-question`)
				})
			} else {
				req.session!.save(() => {
					res.redirect(`/content-management/skills/${req.params.questionID}/delete-question/failed`)
				})
			}
		}


	}

	getDeleteQuestion() {
		return async (req: Request, res: Response, next: NextFunction) => {
			let url: any = req.url
			let errorMessage: string = ""
			let questionID = req.params.questionID
			let passedURL = "/content-management/skills/" + questionID + "/delete-question/failed"
			if (url == passedURL){
				errorMessage = "You must select an option below to continue"
			}
			req.session!.save(() => {
				res.render('page/skills/delete-question', {
					error: errorMessage,
					questionID: questionID
				})
			})
		}
	}

	getDeleteQuiz() {
		return async (req: Request, res: Response, next: NextFunction) => {
			req.session!.save(() => {
				res.render('page/skills/delete-quiz')
			})
		}
	}

	getSkills() {
		return async (req: Request, res: Response, next: NextFunction) => {
			// @ts-ignore
			const userRoles: any = req.user.roles

			if (userRoles.includes('ORGANISATION_REPORTER')) {
				req.session!.save(() => {
					res.redirect(`/content-management/skills/organisation-admin`)
				})
				return
			}

			let professionID: any = null
			let quiz: any = null
			let url: any = req.url
			let message: string = ""
			let errorMessage: string = ""
			let quizResults: any = null

			if(url == '/content-management/skills/add-new-question/success') {
				message = 'Question successfuly added'
			} else if (url == '/content-management/skills/update-question/success') {
				message = 'Your changes have been saved'
			} else if (url == '/content-management/skills/publish-quiz/success') {
				message = 'Your quiz has been published'
			} else if (url == '/content-management/skills/publish-quiz/failure') {
				errorMessage = 'You can only publish a quiz with at least 18 questions'
			} else if (url == '/content-management/skills/edit-quiz-description/success') {
				message = 'Your changes have been saved'
			} else if (url == '/content-management/skills/delete-questions/success') {
				message = 'Question deleted successfully'
			}

			await this.csrsService
				.getCivilServant()
				.then(civilServant => {
					if (civilServant.profession) {
						professionID = civilServant.profession.id
						res.locals.professionID = professionID
					}

				})
				.catch(error => {
					next(error)
				})

			if (!professionID) {
				errorMessage = "Profession is not set, Please set your profession in your profile page."
			}

			if (professionID != null ) {
				let data = { profession: { id: professionID}}

				await this.csrsService
					.createQuizByProfessionID(data, req.user)
					.then(quizInfo => {
						quiz = this.quizFactory.create(quizInfo.data)
					})
					.catch(error => {
						next(error)
					})

				if(userRoles.includes('CSHR_REPORTER') || userRoles.includes('LEARNING_MANAGER')) {
					await this.csrsService
						.getAllQuizResults(req.user)
						.then(response => {
							quizResults = response
						})
						.catch(error => {
							next(error)
						})
				} else {
					await this.csrsService
						.getResultsByProfession(professionID, req.user)
						.then(response => {
							quizResults = response
						})
						.catch(error => {
							next(error)
						})
				}

			}

			req.session!.save(() => {
				res.render('page/skills/skills', {quiz: quiz, message: message, errorMessage: errorMessage, quizResults: quizResults})
			})
		}
	}

	getEditQuestion() {
		return async (req: Request, res: Response, next: NextFunction) => {
			let imageName: any = null

			await this.csrsService
				.getQuestionbyID(req.params.questionID, req.user)
				.then( response => {
					const question = this.questionFactory.create(response)
					// @ts-ignore
					let keys = Object.values(response.answer.answers)
					if (question.imgUrl) {
						imageName = question.imgUrl.split("/").pop()
					}
					req.session!.save(() => {
						res.render('page/skills/question', {
							question: question,
							answerId: response.answer.id,
							keysAnswers: keys,
							imageName: imageName,
							courseCatalogueUrl: config.COURSE_CATALOGUE.url + '/media/skills/image'
						})
					})
				})
				.catch(error => {
					next(error)
				})
			}
	}

	EditQuestion() {
		return async (req: Request, res: Response, next: NextFunction) => {

			const question = this.questionFactory.create(req.body)

			let answer = new Answer()
			answer.answers = req.body.answers
			answer.correctAnswers = req.body.correctAnswers

			let data = {
				"value" : req.body.value,
				"answer": answer,
				"why" : req.body.why,
				'theme': req.body.theme,
				'learningName': req.body.learningName,
				'learningReference': req.body.learningReference,
			}
			let errors = await this.validator.check(data)

			const answerErrors = IsAnswersValid(answer)
			if (req.body.alternativeText == "" && req.body.mediaId != "") {
				let alternativeTextArray = new Array('skills.validation.alternativeText.empty')
				let alternativeText: any = { alternativeTextArray }
				answerErrors.push(alternativeText)
			}

			let newErrors: any = null
			// @ts-ignore
			answerErrors.forEach(function(errorAnswer: any) {
				newErrors = Object.assign(errors.fields, errorAnswer);
			});

			if(req.body.imageRemoved == "True") {
				question.imgUrl = ""
				question.alternativeText = ""
			}

			let errorCounter = 0, key;

			if (newErrors) {
				errors.fields = newErrors
				for (key in errors.fields) {
					if (errors.fields.hasOwnProperty(key)) errorCounter++;
				}
				let errorSize = {size : errorCounter}
				errors = Object.assign(errors, errorSize);
			}

			if (errors.size) {
				req.session!.sessionFlash = {
					errors,
					form: req.body,
				}
				return req.session!.save(() => {
					res.redirect(`/content-management/skills/${req.params.questionID}/edit-question`)
				})
			} else {
				await this.csrsService
					.editQuestion(question, req.user)
					.then( questionDTO => {
						req.session!.save(() => {
							res.redirect('/content-management/skills/update-question/success')
						})
					})
					.catch(error => {
						next(error)
					})
			}
		}
	}

	getAddQuestion() {
		return async (req: Request, res: Response, next: NextFunction) => {
			req.session!.save(() => {
				res.render('page/skills/question', {
					courseCatalogueUrl: config.COURSE_CATALOGUE.url + '/media/skills/image',
				})
			})
		}
	}

	getSkillsReport() {
		return async (req: Request, res: Response, next: NextFunction) => {

			let areasOfWork: any = null

			await this.csrsService
				.getAreasOfWork()
				.then(profs => {
					areasOfWork = profs
				})
				.catch(error => {
					next(error)
				})

			const newFirstElement = {name: 'All'}

			areasOfWork = [newFirstElement].concat(areasOfWork)

			// @ts-ignore
			const userRoles: any = req.user.roles


			if(userRoles.includes('CSHR_REPORTER') || userRoles.includes('LEARNING_MANAGER')) {
				req.session!.save(() => {
					res.render('page/skills/generate-report', {
						placeholder: new PlaceholderDateSkills(),
						professions: areasOfWork,
						role: 'superAdmin'
					})
				})
			} else if (userRoles.includes('ORGANISATION_REPORTER')) {
				req.session!.save(() => {
					res.render('page/skills/generate-report', {
						placeholder: new PlaceholderDateSkills(),
						professions: areasOfWork,
						role: 'orgAdmin'
					})
				})
			} else {
				req.session!.save(() => {
					res.render('page/skills/generate-report', {
						placeholder: new PlaceholderDateSkills(),
						professions: areasOfWork,
						role: 'profAdmin'
					})
				})
			}

		}
	}

	generateReport() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const reportType = 'Skills_information_'
			const filename = reportType.concat(moment().toISOString())
			const body = req.body
			const startDate = body.startYear + "-" + body.startMonth + "-" + body.startDay
			const endDate = body.endYear + "-" + body.endMonth + "-" + body.endDay
			const professionID = body.profession
			const role = req.body.role

			if(role == 'superAdmin') {
				try {
					await this.csrsService
						.getReportForSuperAdmin(startDate, endDate, professionID, req.user)
						.then(report => {
							res.writeHead(200, {
								'Content-type': 'text/csv',
								'Content-disposition': `attachment;filename=${filename}.csv`,
								'Content-length': report.length,
							})
							res.end(Buffer.from(report, 'binary'))
						})
						.catch(error => {
							next(error)
						})
				} catch (error) {
					throw new Error(error)
				}
			} else if (role == 'orgAdmin') {
				try {

					await this.csrsService
						.getCivilServant()
						.then(civilServant => {
							if (civilServant.organisationalUnit.id) {
								res.locals.organisatonID = civilServant.organisationalUnit.id
							}

						})
						.catch(error => {
							next(error)
						})


					await this.csrsService
						.getReportForOrgAdmin(startDate, endDate, res.locals.organisatonID,professionID, req.user)
						.then(report => {
							res.writeHead(200, {
								'Content-type': 'text/csv',
								'Content-disposition': `attachment;filename=${filename}.csv`,
								'Content-length': report.length,
							})
							res.end(Buffer.from(report, 'binary'))
						})
						.catch(error => {
							next(error)
						})
				} catch (error) {
					throw new Error(error)
				}
			} else if (role == 'profAdmin') {

				try {

					await this.csrsService
						.getCivilServant()
						.then(civilServant => {
							if (civilServant.profession) {
								res.locals.professionID = civilServant.profession.id
							}

						})
						.catch(error => {
							next(error)
						})

					await this.csrsService
						.getReportForProfAdmin(startDate, endDate, res.locals.professionID, req.user)
						.then(report => {
							res.writeHead(200, {
								'Content-type': 'text/csv',
								'Content-disposition': `attachment;filename=${filename}.csv`,
								'Content-length': report.length,
							})
							res.end(Buffer.from(report, 'binary'))
						})
						.catch(error => {
							next(error)
						})
				} catch (error) {
					throw new Error(error)
				}
			}
		}
	}


	getEditQuizDescription() {
		return async (req: Request, res: Response, next: NextFunction) => {

			let profession = new Profession()

			await this.csrsService
				.getCivilServant()
				.then(civilServant => {
					if (civilServant.profession) {
						profession.id = civilServant.profession.id
					}
				})
				.catch(error => {
					next(error)
				})

			await this.csrsService
				.getQuizByProfession(profession.id, req.user)
				.then( response => {
					req.session!.save(() => {
						res.render('page/skills/edit-quiz-description', {
							quiz: response
						})
					})
				})
				.catch(error => {
					res.redirect(`/content-management/skills/publish-quiz/failure`)
				})

		}
	}
}
