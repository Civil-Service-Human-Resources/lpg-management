import { JsonRestService } from "../../lib/http/jsonRestService"
import * as config from '../../config/index'

export class CivilServantProfileService {
    jsonRestService: JsonRestService

    constructor(){
        const registryConfig = {
            url: config.REGISTRY_SERVICE.url,
            timeout: config.REGISTRY_SERVICE.timeout
        }

        this.jsonRestService = new JsonRestService(registryConfig, null)
    }

    async getProfile(accessToken: string){
        let profile = await this.jsonRestService.getWithConfig("/civilServants/me", this.getAuthorisationHeaderFromAccessToken(accessToken))        
        return profile
    }

    getAuthorisationHeaderFromAccessToken(accessToken: any){
		return {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		}
	}
}