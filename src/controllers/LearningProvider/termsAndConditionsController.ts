import {Request, Response} from 'express'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {TermsAndConditionsValidator} from '../../learning-catalogue/validator/termsAndConditionsValidator'
import {TermsAndConditionsFactory} from '../../learning-catalogue/model/factory/termsAndConditionsFactory'

const logger = log4js.getLogger('controllers/learningProviderController')

export class TermsAndConditionsController {
	learningCatalogue: LearningCatalogue
	termsAndConditionsValidator: TermsAndConditionsValidator
	termsAndConditionsFactory: TermsAndConditionsFactory

	constructor(
		learningCatalogue: LearningCatalogue,
		termsAndConditionsValidator: TermsAndConditionsValidator,
		termsAndConditionsFactory: TermsAndConditionsFactory
	) {
		this.learningCatalogue = learningCatalogue
		this.termsAndConditionsValidator = termsAndConditionsValidator
		this.termsAndConditionsFactory = termsAndConditionsFactory
	}

	public getTermsAndConditions(isEdit: Boolean) {
		logger.debug('Getting terms and conditions')
		if (isEdit) {
			return async (request: Request, response: Response) => {
				await this.getTermsAndConditionsAndRenderTemplate(
					request,
					response,
					'page/add-terms-and-conditions',
					isEdit
				)
			}
		} else {
			return async (request: Request, response: Response) => {
				await this.getLearningProviderAndRenderTemplate(request, response, 'page/add-terms-and-conditions')
			}
		}
	}

	public setTermsAndConditions() {
		const self = this

		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const termsAndConditions = this.termsAndConditionsFactory.create(data)

			const errors = await this.termsAndConditionsValidator.check(request.body, ['title'])
			if (errors.size) {
				return response.render('page/add-terms-and-conditions', {
					errors: errors,
				})
			}
			const learningProviderId: string = request.params.learningProviderId

			await self.learningCatalogue.createTermsAndConditions(learningProviderId, termsAndConditions)

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}

	public updateTermsAndConditions() {
		const self = this

		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const errors = await this.termsAndConditionsValidator.check(request.body, ['title'])

			const learningProviderId = request.params.learningProviderId
			const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)
			const termsAndConditionsId = request.params.termsAndConditionsId
			const termsAndConditions = await this.learningCatalogue.getTermsAndConditions(
				learningProviderId,
				termsAndConditionsId
			)

			if (errors.size) {
				return response.render('page/add-terms-and-conditions', {
					errors: errors,
					learningProvider: learningProvider,
					termsAndConditions: termsAndConditions,
					isEdit: true,
				})
			}

			termsAndConditions.name = data.name
			termsAndConditions.content = data.content

			await self.learningCatalogue.updateTermsAndConditions(
				learningProviderId,
				termsAndConditionsId,
				termsAndConditions
			)

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}

	public deleteTermsAndConditions() {
		const self = this

		return async (request: Request, response: Response) => {
			const learningProviderId = request.params.learningProviderId
			const termsAndConditionsId = request.params.termsAndConditionsId

			await self.learningCatalogue.deleteTermsAndConditions(learningProviderId, termsAndConditionsId)

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}

	private async getLearningProviderAndRenderTemplate(request: Request, response: Response, view: string) {
		const learningProviderId: string = request.params.learningProviderId
		const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)
		if (learningProvider) {
			response.render(view, {learningProvider})
		} else {
			response.sendStatus(404)
		}
	}

	private async getTermsAndConditionsAndRenderTemplate(
		request: Request,
		response: Response,
		view: string,
		isEdit: Boolean
	) {
		const learningProviderId: string = request.params.learningProviderId
		const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)

		const termsAndConditionsId: string = request.params.termsAndConditionsId
		const termsAndConditions = await this.learningCatalogue.getTermsAndConditions(
			learningProviderId,
			termsAndConditionsId
		)

		if (learningProvider) {
			response.render(view, {
				learningProvider: learningProvider,
				termsAndConditions: termsAndConditions,
				isEdit: isEdit,
			})
		} else {
			response.sendStatus(404)
		}
	}
}
