import { ChartjsConfig} from '../../../report-service/model/chartjsConfig'
import {ReportingFilterSummary} from './reportingFilterSummary'
import {CourseCompletionsFilterModel} from './courseCompletionsFilterModel'

export class CourseCompletionsGraphModel {

	constructor(public chart: ChartjsConfig, public table: {text: string}[][], public courseBreakdown: {text: string}[][],
				public selectedFilters: ReportingFilterSummary, public filters: CourseCompletionsFilterModel) { }
}
