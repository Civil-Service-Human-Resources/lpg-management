import * as config from '../../config/index'
import { AxiosInstance } from "axios"

export class CivilServantProfileService {
    http: AxiosInstance

    constructor(http: AxiosInstance){
        this.http = http
    }

    async getProfile(accessToken: string){
        const response = await this.http.get("/civilServants/me", {
            baseURL: config.REGISTRY_SERVICE.url,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        return response.data
    }

    getAuthorisationHeaderFromAccessToken(accessToken: any){
		return {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	}
}