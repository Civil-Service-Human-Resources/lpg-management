import {Request, Response, Router} from 'express'
import * as log4js from 'log4js'
import {Pagination} from 'lib/pagination'
import {LearningCatalogue} from '../../learning-catalogue'
import {LearningProviderFactory} from '../../learning-catalogue/model/factory/learningProviderFactory'
import {DefaultPageResults} from '../../learning-catalogue/model/defaultPageResults'
import {LearningProvider} from '../../learning-catalogue/model/learningProvider'
import {Validator} from '../../learning-catalogue/validator/validator'

const logger = log4js.getLogger('controllers/learningProviderController')

export class LearningProviderController {
	learningCatalogue: LearningCatalogue
	learningProviderValidator: Validator<LearningProvider>
	learningProviderFactory: LearningProviderFactory
	pagination: Pagination
	router: Router

	constructor(
		learningCatalogue: LearningCatalogue,
		learningProviderFactory: LearningProviderFactory,
		learningProviderValidator: Validator<LearningProvider>,
		pagination: Pagination
	) {
		this.learningCatalogue = learningCatalogue
		this.learningProviderFactory = learningProviderFactory
		this.learningProviderValidator = learningProviderValidator
		this.pagination = pagination

		this.router = Router()

		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		this.router.param('learningProviderId', async (ireq, res, next, learningProviderId) => {
			const learningProvider = await this.learningCatalogue.getLearningProvider(learningProviderId)

			if (learningProvider) {
				res.locals.learningProvider = learningProvider
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.get('/content-management/learning-providers', this.index())
		this.router.get('/content-management/learning-providers/learning-provider', this.getLearningProvider())
		this.router.post('/content-management/learning-providers/learning-provider', this.setLearningProvider())
		this.router.get(
			'/content-management/learning-providers/:learningProviderId',
			this.getLearningProviderOverview()
		)
	}

	public index() {
		logger.debug('Getting Learning Providers')
		return async (request: Request, response: Response) => {
			let {page, size} = this.pagination.getPageAndSizeFromRequest(request)

			// prettier-ignore
			const pageResults: DefaultPageResults<LearningProvider> = await this.learningCatalogue.listLearningProviders(page, size)

			response.render('page/learning-provider/learning-providers', {pageResults})
		}
	}

	public getLearningProvider() {
		return async (request: Request, response: Response) => {
			response.render('page/learning-provider/learning-provider')
		}
	}

	public getLearningProviderOverview() {
		return async (request: Request, response: Response) => {
			response.render('page/learning-provider/learning-provider-overview')
		}
	}

	public setLearningProvider() {
		return async (request: Request, response: Response) => {
			const data = {
				...request.body,
			}

			const learningProvider = this.learningProviderFactory.create(data)

			const errors = await this.learningProviderValidator.check(request.body, ['name'])
			if (errors.size) {
				request.session!.sessionFlash = {errors: errors}
				return response.redirect('/content-management/learning-providers/learning-provider')
			}

			const newLearningProvider = await this.learningCatalogue.createLearningProvider(learningProvider)

			response.redirect('/content-management/learning-providers/' + newLearningProvider.id)
		}
	}
}
