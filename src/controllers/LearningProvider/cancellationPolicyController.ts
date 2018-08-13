import {Request, Response} from 'express'
import * as log4js from 'log4js'
import {LearningCatalogue} from '../../learning-catalogue'
import {CancellationPolicyValidator} from '../../learning-catalogue/validator/cancellationPolicyValidator'
import {CancellationPolicyFactory} from '../../learning-catalogue/model/factory/cancellationPolicyFactory'

const logger = log4js.getLogger('controllers/learningProviderController')

export class CancellationPolicyController {
	learningCatalogue: LearningCatalogue
	cancellationPolicyValidator: CancellationPolicyValidator
	cancellationPolicyFactory: CancellationPolicyFactory

	constructor(
		learningCatalogue: LearningCatalogue,
		cancellationPolicyValidator: CancellationPolicyValidator,
		cancellationPolicyFactory: CancellationPolicyFactory
	) {
		this.learningCatalogue = learningCatalogue
		this.cancellationPolicyValidator = cancellationPolicyValidator
		this.cancellationPolicyFactory = cancellationPolicyFactory
	}

	public getCancellationPolicy(isEdit: Boolean) {
		logger.debug('Getting cancellation policy')
		return async (request: Request, response: Response) => {
			await this.getLearningProviderAndRenderTemplate(request, response, 'page/add-cancellation-policy', isEdit)
		}
	}

	public setCancellationPolicy(isEdit: Boolean) {
		const self = this

		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const cancellationPolicy = this.cancellationPolicyFactory.create(data)

			const errors = await this.cancellationPolicyValidator.check(request.body, ['name'])
			if (errors.size) {
				return response.render('page/add-cancellation-policy', {
					errors: errors,
					isEdit: isEdit,
				})
			}
			const learningProviderId: string = request.params.learningProviderId

			if (isEdit) {
				const cancellationPolicyId = request.params.cancellationPolicyId

				await self.learningCatalogue.updateCancellationPolicy(
					learningProviderId,
					cancellationPolicyId,
					cancellationPolicy
				)
			} else {
				await self.learningCatalogue.createCancellationPolicy(learningProviderId, cancellationPolicy)
			}

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}

	private async getLearningProviderAndRenderTemplate(
		request: Request,
		response: Response,
		view: string,
		isEdit: Boolean
	) {
		const learningProviderId: string = request.params.learningProviderId
		const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)

		const cancellationPolicyId: string = request.params.cancellationPolicyId
		const cancellationPolicy = await this.learningCatalogue.getCancellationPolicy(
			learningProviderId,
			cancellationPolicyId
		)

		console.log(learningProviderId + ' , ' + cancellationPolicy)

		if (learningProvider) {
			response.render(view, {learningProvider, cancellationPolicy, isEdit})
		} else {
			response.sendStatus(404)
		}
	}
}
