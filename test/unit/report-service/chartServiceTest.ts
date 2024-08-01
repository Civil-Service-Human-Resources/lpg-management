import {ChartJsService} from '../../../src/report-service/chartJsService'
import * as Sinon from 'sinon'
import {ChartJsXaxisService} from '../../../src/report-service/model/chartConfig/ChartJsXaxisService'
import {XAxisSettings} from '../../../src/report-service/model/chartConfig/xAxisSettings'
import {expect} from 'chai'

describe('ChartJS implementation tests', () => {
	const chartJsXaxisService = Sinon.createStubInstance(ChartJsXaxisService)
	const xAxisSettings = new XAxisSettings("Table", "hA", "day")
	chartJsXaxisService.getSetting.returns(xAxisSettings)
	const chartService = new ChartJsService(chartJsXaxisService as any)
	describe('buildChart tests', () => {
		it("Should build the chartJS configuration", () => {
			const data: Map<string, number> = new Map<string, number>([
				["2024-01-01T10:00:00", 1],
				["2024-01-01T11:00:00", 2]
			])
			const result = chartService.buildChart(data, "day")
			expect(result.xAxisSettings.unit).to.eql("day")
			expect(result.xAxisSettings.tableHeader).to.eql("Table")
			expect(result.xAxisSettings.tooltipFormat).to.eql("hA")
			expect(result.data[0].x).to.eq("2024-01-01T10:00:00")
			expect(result.data[0].y).to.eq(1)
			expect(result.data[1].x).to.eq("2024-01-01T11:00:00")
			expect(result.data[1].y).to.eq(2)
			expect(result.noJSChart.get("10AM")).to.eq(1)
			expect(result.noJSChart.get("11AM")).to.eq(2)
		})
	})
})
