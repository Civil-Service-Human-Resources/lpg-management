import {Request, Response, Router} from 'express'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {TermsAndConditionsFactory} from '../../learning-catalogue/model/factory/termsAndConditionsFactory'
import {Validator} from '../../learning-catalogue/validator/validator'
import {TermsAndConditions} from '../../learning-catalogue/model/termsAndConditions'

const logger = log4js.getLogger('controllers/learningProviderController')

export class TermsAndConditionsController {
	learningCatalogue: LearningCatalogue
	termsAndConditionsValidator: Validator<TermsAndConditions>
	termsAndConditionsFactory: TermsAndConditionsFactory
	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		termsAndConditionsFactory: TermsAndConditionsFactory,
		termsAndConditionsValidator: Validator<TermsAndConditions>
	) {
		this.learningCatalogue = learningCatalogue
		this.termsAndConditionsValidator = termsAndConditionsValidator
		this.termsAndConditionsFactory = termsAndConditionsFactory

		this.router = Router()

		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		this.router.param('termsAndConditionsId', async (req, res, next, termsAndConditionsId) => {
			const learningProviderId = req.params.learningProviderId

			const termsAndConditions = await this.learningCatalogue.getTermsAndConditions(
				learningProviderId,
				termsAndConditionsId
			)

			if (termsAndConditions) {
				res.locals.termsAndConditions = termsAndConditions
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.param('learningProviderId', async (req, res, next, learningProviderId) => {
			const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)

			if (learningProvider) {
				res.locals.learningProvider = learningProvider
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.get(
			'/content-management/learning-providers/:learningProviderId/terms-and-conditions/:termsAndConditionsId?',
			this.getTermsAndConditions()
		)

		this.router.post(
			'/content-management/learning-providers/:learningProviderId/terms-and-conditions/:termsAndConditionsId?',
			this.setTermsAndConditions()
		)

		this.router.get(
			'/content-management/learning-providers/:learningProviderId/terms-and-conditions/:termsAndConditionsId?/delete',
			this.deleteTermsAndConditions()
		)
	}

	public getTermsAndConditions() {
		logger.debug('Getting terms and conditions')
		return async (request: Request, response: Response) => {
			response.render('page/learning-provider/terms-and-conditions')
		}
	}

	public setTermsAndConditions() {
		return async (request: Request, response: Response) => {
			const learningProviderId: string = request.params.learningProviderId

			const data = {
				...request.body,
			}

			const termsAndConditions = this.termsAndConditionsFactory.create(data)

			const errors = await this.termsAndConditionsValidator.check(request.body, ['name', 'content'])
			if (errors.size) {
				return response.render('page/learning-provider/terms-and-conditions', {
					errors: errors,
					termsAndConditions:termsAndConditions
				})
			}

			if (request.params.termsAndConditionsId) {
				await this.editTermsAndConditions(request, response)

				return response.redirect(`/content-management/learning-providers/${learningProviderId}`)
			}

			await this.learningCatalogue.createTermsAndConditions(learningProviderId, termsAndConditions)

			response.redirect(`/content-management/learning-providers/${learningProviderId}`)
		}
	}

	public deleteTermsAndConditions() {
		return async (request: Request, response: Response) => {
			const learningProviderId: string = request.params.learningProviderId
			const termsAndConditionsId: string = request.params.termsAndConditionsId

			await this.learningCatalogue.deleteTermsAndConditions(learningProviderId, termsAndConditionsId)

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}

	private async editTermsAndConditions(request: Request, response: Response) {
		const data = {
			...request.body,
			id: response.locals.termsAndConditions.id,
			name: request.body.name || response.locals.termsAndConditions.title,
			fullVersion: request.body.content || response.locals.termsAndConditions.content,
		}

		const termsAndConditions = this.termsAndConditionsFactory.create(data)

		await this.learningCatalogue.updateTermsAndConditions(request.params.learningProviderId, termsAndConditions)
	}
}
