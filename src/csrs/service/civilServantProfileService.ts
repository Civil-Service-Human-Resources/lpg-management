import * as config from '../../config/index'
import { AxiosInstance } from "axios"
import {Profile} from '../model/profile'
import {plainToInstance} from 'class-transformer'
import {ProfileCache} from '../profileCache'
import {getLogger} from '../../utils/logger'

export class CivilServantProfileService {

	private logger = getLogger("CivilServantProfileService")

	constructor(private http: AxiosInstance,
				private readonly profileCache: ProfileCache){ }

    async getProfile(uid: string, accessToken: string){
		console.log("Getting profile")
		let profile = await this.profileCache.get(uid)
		if (!profile) {
			const response = await this.http.post("/civilServants/me/login", null,
				{
				baseURL: config.REGISTRY_SERVICE.url,
				headers: {
					Authorization: `Bearer ${accessToken}`
				}})
			console.log(accessToken)
			profile = plainToInstance(Profile, response.data as Profile)
			console.log("Setting profile to cache")
			await this.profileCache.setObject(profile)
		}
		console.log("Returning profile")
		return profile
    }

	async removeProfileFromCache(uid: string) {
		this.logger.debug(`Deleting user ${uid} from profile cache`)
		await this.profileCache.delete(uid)
	}

	async updateProfileCache(profile: Profile) {
		await this.profileCache.setObject(profile)
	}

}
