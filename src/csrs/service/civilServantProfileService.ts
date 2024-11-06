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

	async loginAndFetchProfile(accessToken: string) {
		const response = await this.http.post("/civilServants/me/login", null,
			{
				baseURL: config.REGISTRY_SERVICE.url,
				headers: {
					Authorization: `Bearer ${accessToken}`
				}})
		return plainToInstance(Profile, response.data as Profile)
	}

    async getProfile(uid: string, accessToken: string){
		let profile = await this.profileCache.get(uid)
		if (!profile) {
			profile = await this.fetchNewProfile(accessToken)
		}
		return profile
    }

	async removeProfileFromCache(uid: string) {
		this.logger.debug(`Deleting user ${uid} from profile cache`)
		await this.profileCache.delete(uid)
	}

	async updateProfileCache(profile: Profile) {
		await this.profileCache.setObject(profile)
	}

	async fetchNewProfile(accessToken: string) {
		const profile = await this.loginAndFetchProfile(accessToken)
		await this.updateProfileCache(profile)
		return profile
	}
}
