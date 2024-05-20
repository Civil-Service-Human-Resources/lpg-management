import {HTTP_SETTINGS} from '../../config/index'
import {RestServiceConfig} from '../../lib/http/restServiceConfig'

const globalDetailedLogs = HTTP_SETTINGS.global_enable_detail_logs

export function createConfig(rawSettings: {url: string, timeout: number, detailedLogs?: boolean}) {
	const useDetailedLogs = globalDetailedLogs ? globalDetailedLogs : rawSettings.detailedLogs || false
	return new RestServiceConfig(rawSettings.url, rawSettings.timeout, useDetailedLogs)
}
