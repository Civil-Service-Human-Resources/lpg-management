import { ChartjsConfig} from '../../../report-service/model/chartjsConfig'
import {TablePageModel} from './tablePageModel'

export class CourseCompletionsGraphModel {
	constructor(public chart: ChartjsConfig, public table: TablePageModel,
				public courseBreakdown: TablePageModel) { }
}
