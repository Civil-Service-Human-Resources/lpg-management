import {XAxisSettings} from './xAxisSettings'

export class ChartJsXaxisService {

	private settingsMap: Map<string, XAxisSettings>

	constructor(private xAxisSettings: XAxisSettings[], private defaultSetting: XAxisSettings) {
		this.settingsMap = new Map<string, XAxisSettings>(this.xAxisSettings.map(setting => [setting.unit, setting]))
	}

	getSetting(unit: string) {
		return this.settingsMap.get(unit) || this.defaultSetting
	}

}
