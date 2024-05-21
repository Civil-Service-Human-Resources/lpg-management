import {HTTP_SETTINGS} from '../../config/index'
import {RestServiceConfig} from '../../lib/http/restServiceConfig'

const globalDetailedLogs = HTTP_SETTINGS.globalEnableDetailLogs

export function createConfig(rawSettings: {url: string, timeout: number, detailedLogs?: boolean}) {
	const useDetailedLogs = globalDetailedLogs ? globalDetailedLogs : rawSettings.detailedLogs || false
	console.log(globalDetailedLogs)
	return new RestServiceConfig(rawSettings.url, rawSettings.timeout, useDetailedLogs)
}
