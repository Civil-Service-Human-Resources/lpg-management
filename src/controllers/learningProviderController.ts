import {Request, Response} from 'express'
import {LearningProviderValidator} from '../learning-catalogue/validator/learningProviderValidator'
import {LearningProviderFactory} from '../learning-catalogue/model/factory/learningProviderFactory'
import * as log4js from 'log4js'
import {DefaultPageResults} from '../learning-catalogue/model/defaultPageResults'
import {LearningProvider} from '../learning-catalogue/model/learningProvider'
import {LearningCatalogue} from '../learning-catalogue'
import {Pagination} from 'lib/pagination'

const logger = log4js.getLogger('controllers/learningProviderController')

export class LearningProviderController {
	learningCatalogue: LearningCatalogue
	learningProviderValidator: LearningProviderValidator
	learningProviderFactory: LearningProviderFactory
	pagination: Pagination

	constructor(
		learningCatalogue: LearningCatalogue,
		learningProviderValidator: LearningProviderValidator,
		learningProviderFactory: LearningProviderFactory,
		pagination: Pagination
	) {
		this.learningCatalogue = learningCatalogue
		this.learningProviderValidator = learningProviderValidator
		this.learningProviderFactory = learningProviderFactory
		this.pagination = pagination
	}

	public index() {
		logger.debug('Getting Learning Providers')
		const self = this

		return async (request: Request, response: Response) => {
			let {page, size} = this.pagination.getPageAndSizeFromRequest(request)

			// prettier-ignore
			const pageResults: DefaultPageResults<LearningProvider> = await self.learningCatalogue.listLearningProviders(page, size)

			response.render('page/learning-providers', {pageResults})
		}
	}

	public getLearningProvider() {
		return async (request: Request, response: Response) => {
			response.render('page/add-learning-provider')
		}
	}

	public setLearningProvider() {
		const self = this

		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const learningProvider = this.learningProviderFactory.create(data)

			const errors = await this.learningProviderValidator.check(request.body, ['name'])
			if (errors.size) {
				return response.render('page/add-learning-provider', {
					errors: errors,
				})
			}

			await self.learningCatalogue.createLearningProvider(learningProvider)

			response.redirect('/content-management/learning-providers')
		}
	}
}
