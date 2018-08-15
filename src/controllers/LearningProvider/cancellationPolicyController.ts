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
		if (isEdit) {
			return async (request: Request, response: Response) => {
				await this.getCancellationPolicyAndRenderTemplate(
					request,
					response,
					'page/add-cancellation-policy',
					isEdit
				)
			}
		} else {
			return async (request: Request, response: Response) => {
				await this.getLearningProviderAndRenderTemplate(
					request,
					response,
					'page/add-cancellation-policy',
					isEdit
				)
			}
		}
	}

	public setCancellationPolicy() {
		const self = this

		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const learningProviderId: string = request.params.learningProviderId
			const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)

			const cancellationPolicy = this.cancellationPolicyFactory.create(data)

			const errors = await this.cancellationPolicyValidator.check(request.body, ['name'])

			if (errors.size) {
				return response.render('page/add-cancellation-policy', {
					errors: errors,
					learningProvider: learningProvider,
					cancellationPolicy: cancellationPolicy,
				})
			}

			await self.learningCatalogue.createCancellationPolicy(learningProviderId, cancellationPolicy)

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}

	public updateCancellationPolicy() {
		const self = this

		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const errors = await this.cancellationPolicyValidator.check(request.body, ['name'])

			const learningProviderId: string = request.params.learningProviderId
			const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)
			const cancellationPolicyId: string = request.params.cancellationPolicyId
			const cancellationPolicy = await this.learningCatalogue.getCancellationPolicy(
				learningProviderId,
				cancellationPolicyId
			)

			if (errors.size) {
				return response.render('page/add-cancellation-policy', {
					errors: errors,
					learningProvider: learningProvider,
					cancellationPolicy: cancellationPolicy,
					isEdit: true,
				})
			}

			cancellationPolicy.name = data.name
			cancellationPolicy.shortVersion = data.shortVersion
			cancellationPolicy.fullVersion = data.fullVersion

			await self.learningCatalogue.updateCancellationPolicy(
				learningProviderId,
				cancellationPolicyId,
				cancellationPolicy
			)

			response.redirect('/content-management/learning-providers/' + learningProviderId)
		}
	}

	public deleteCancellationPolicy() {
		const self = this

		return async (request: Request, response: Response) => {
			const learningProviderId: string = request.params.learningProviderId
			const cancellationPolicyId: string = request.params.cancellationPolicyId

			await self.learningCatalogue.deleteCancellationPolicy(learningProviderId, cancellationPolicyId)

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

		if (learningProvider) {
			response.render(view, {learningProvider, isEdit})
		} else {
			response.sendStatus(404)
		}
	}

	private async getCancellationPolicyAndRenderTemplate(
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

		if (learningProvider) {
			response.render(view, {learningProvider, cancellationPolicy, isEdit})
		} else {
			response.sendStatus(404)
		}
	}
}
