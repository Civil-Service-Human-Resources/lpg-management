import { ChartjsConfig} from '../../../report-service/model/chartjsConfig'

export class CourseCompletionsGraphModel {
	constructor(public chart: ChartjsConfig, public table: {text: string}[][]) { }
}
