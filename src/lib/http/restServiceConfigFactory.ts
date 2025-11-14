import {HTTP_SETTINGS} from '../../config/index'
import {RestServiceConfig} from '../../lib/http/restServiceConfig'
import {Auth} from '../../identity/auth'
import {OauthRestService} from '../../lib/http/oauthRestService'

const globalDetailedLogs = HTTP_SETTINGS.globalEnableDetailLogs

export function createConfig(rawSettings: {url: string, timeout: number, detailedLogs?: boolean}) {
	const useDetailedLogs = globalDetailedLogs ? globalDetailedLogs : rawSettings.detailedLogs || false
	return new RestServiceConfig(rawSettings.url, rawSettings.timeout, useDetailedLogs)
}

export function createOAuthConfig(rawSettings: {url: string, timeout: number, detailedLogs?: boolean}, auth: Auth) {
	const config = createConfig(rawSettings)
	return new OauthRestService(config, auth)
}
