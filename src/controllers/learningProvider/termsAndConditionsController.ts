import {Request, Response, Router} from 'express'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {TermsAndConditionsFactory} from '../../learning-catalogue/model/factory/termsAndConditionsFactory'
import {ContentRequest} from '../../extended'
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

	private setRouterPaths() {
		this.router.param('termsAndConditionsId', async (ireq, res, next, termsAndConditionsId) => {
			const req = ireq as ContentRequest

			const learningProviderId = req.params.learningProviderId

			const termsAndConditions = await this.learningCatalogue.getTermsAndConditions(
				learningProviderId,
				termsAndConditionsId
			)

			if (termsAndConditions) {
				req.termsAndConditions = termsAndConditions
			} else {
				res.sendStatus(404)
			}
			next()
		})

		this.router.param('learningProviderId', async (ireq, res, next, learningProviderId) => {
			const req = ireq as ContentRequest

			const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)

			if (learningProvider) {
				req.learningProvider = learningProvider
			} else {
				res.sendStatus(404)
			}
			next()
		})

		this.router.get(
			'/content-management/learning-providers/:learningProviderId/add-terms-and-conditions',
			this.getTermsAndConditions()
		)

		this.router.post(
			'/content-management/learning-providers/:learningProviderId/add-terms-and-conditions',
			this.setTermsAndConditions()
		)
	}

	public getTermsAndConditions() {
		logger.debug('Getting terms and conditions')
		return async (request: Request, response: Response) => {
			const req = request as ContentRequest
			const learningProvider = req.learningProvider

			response.render('page/add-terms-and-conditions', {learningProvider: learningProvider})
		}
	}

	public setTermsAndConditions() {
		return async (request: Request, response: Response) => {
			const learningProviderId: string = request.params.learningProviderId

			const data = {
				...request.body,
			}

			const termsAndConditions = this.termsAndConditionsFactory.create(data)

			const errors = await this.termsAndConditionsValidator.check(request.body, ['title'])
			if (errors.size) {
				request.session!.sessionFlash = {errors: errors}
				return response.redirect(
					'/content-management/learning-providers/' + learningProviderId + '/add-terms-and-conditions'
				)
			}

			await this.learningCatalogue.createTermsAndConditions(learningProviderId, termsAndConditions)

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}
}
