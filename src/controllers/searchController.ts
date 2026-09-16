import {Request, Response} from 'express'
import {plainToInstance} from 'class-transformer'
import {SearchService} from '../learning-catalogue/service/searchService'
import {SearchFilterQuery} from './models/searchFilterQuery'
import {Controller} from './controller'
import {IUserRole} from 'src/identity/identity'
import {getRequest, Route} from './route'

export class SearchController extends Controller {
	constructor(private service: SearchService) {
		super('/content-management/search', 'searchController')
		this.service = service
	}

    protected getRequiredRole(): IUserRole | undefined {
        return undefined
    }

	protected getRoutes(): Route[] {
		return [
			getRequest('/', this.searchCourses())
		]
	}

	searchCourses() {
		return async (request: Request, response: Response) => {
			const params = plainToInstance(SearchFilterQuery, request.query)
			const pageModel = await this.service.searchForCourses(params, request)
			response.render('page/search-results.njk', {pageModel})
		}
	}
}
