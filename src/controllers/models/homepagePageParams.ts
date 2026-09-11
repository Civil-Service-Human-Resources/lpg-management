import {SearchQuery} from './searchQuery'

export class HomepagePageParams extends SearchQuery {

	getBaseUrl(): string {
		return '/content-management'
	}
}