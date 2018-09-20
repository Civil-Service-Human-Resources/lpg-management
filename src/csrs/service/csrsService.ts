<<<<<<< HEAD
// import {RestService} from '../../learning-catalogue/service/restService'
import * as traverson from 'traverson'
import * as hal from 'traverson-hal'

export class CsrsService {
	constructor() {}

	async getNode(node: string) {
		traverson.registerMediaType(hal.mediaType, hal)
		const result = await new Promise((resolve, reject) =>
			traverson
				.from('http://localhost:9002')
				.jsonHal()
				.follow(node, 'self')
				.getResource((error: any, document: any) => {
					if (error) {
						reject(false)
					} else {
						resolve(document)
					}
				})
		)

		return (result as any)._embedded[node]
	}

	async getNameFromNodeData(data: any) {
		const names = data.map((data: any) => {
			return data.name
		})
		return names
=======
import {RestService} from '../../learning-catalogue/service/restService'

export class CsrsService {
	restService: RestService

	constructor(restService: RestService) {
		this.restService = restService
	}

	async getOrganisations() {
		return await this.restService.get('organisations')
>>>>>>> origin
	}
}
