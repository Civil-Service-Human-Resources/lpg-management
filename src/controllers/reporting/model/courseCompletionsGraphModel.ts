import { ChartjsConfig} from '../../../report-service/model/chartjsConfig'
import {ReportingFilterSummary} from './reportingFilterSummary'

export class CourseCompletionsGraphModel {
	constructor(public chart: ChartjsConfig, public table: {text: string}[][], public courseBreakdown: {text: string}[][],
				public selectedFilters: ReportingFilterSummary) { }
}
