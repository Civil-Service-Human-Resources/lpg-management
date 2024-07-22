var dayjs = require('dayjs')
import {expect} from 'chai'
import {ChartService} from '../../../src/report-service/chartService'
import {Increment} from '../../../src/report-service/model/increment'

describe('ChartJS implementation tests', () => {
	const chartService = new ChartService()
	describe('buildGraphDataPoints tests', () => {
		it('Should build labels in hourly increments', () => {
			const startDate = dayjs("2024-01-01 00:00:00")
			const endDate = dayjs("2024-01-01 08:00:00")
			const increment = new Increment(1, 'hour')
			const rawData = new Map<string, number>()
			rawData.set("2024-01-01T01:00:00", 10)
			rawData.set("2024-01-01T05:00:00", 1)
			rawData.set("2024-01-01T07:00:00", 20)
			rawData.set("2024-01-01T08:00:00", 30)
			const data = chartService.buildGraphDataPoints(startDate, endDate, increment, rawData)
			expect(data.length).to.eql(9)
			expect(data[0].x).to.eql("2024-01-01T00:00:00")
			expect(data[0].y).to.eql(0)
			expect(data[1].x).to.eql("2024-01-01T01:00:00")
			expect(data[1].y).to.eql(10)
			expect(data[2].x).to.eql("2024-01-01T02:00:00")
			expect(data[2].y).to.eql(0)
			expect(data[3].x).to.eql("2024-01-01T03:00:00")
			expect(data[3].y).to.eql(0)
			expect(data[4].x).to.eql("2024-01-01T04:00:00")
			expect(data[4].y).to.eql(0)
			expect(data[5].x).to.eql("2024-01-01T05:00:00")
			expect(data[5].y).to.eql(1)
			expect(data[6].x).to.eql("2024-01-01T06:00:00")
			expect(data[6].y).to.eql(0)
			expect(data[7].x).to.eql("2024-01-01T07:00:00")
			expect(data[7].y).to.eql(20)
			expect(data[8].x).to.eql("2024-01-01T08:00:00")
			expect(data[8].y).to.eql(30)
		})
		it('Should build labels in daily increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-01-07 15:00:00")
			const increment = new Increment(1, 'day')
			const rawData = new Map<string, number>()
			rawData.set("2024-01-01", 10)
			rawData.set("2024-01-02", 1)
			rawData.set("2024-01-04", 20)
			rawData.set("2024-01-05", 30)
			const data = chartService.buildGraphDataPoints(startDate, endDate, increment, rawData)
			expect(data.length).to.eql(7)
			expect(data[0].x).to.eql("2024-01-01")
			expect(data[0].y).to.eql(10)
			expect(data[1].x).to.eql("2024-01-02")
			expect(data[1].y).to.eql(1)
			expect(data[2].x).to.eql("2024-01-03")
			expect(data[2].y).to.eql(0)
			expect(data[3].x).to.eql("2024-01-04")
			expect(data[3].y).to.eql(20)
			expect(data[4].x).to.eql("2024-01-05")
			expect(data[4].y).to.eql(30)
			expect(data[5].x).to.eql("2024-01-06")
			expect(data[5].y).to.eql(0)
			expect(data[6].x).to.eql("2024-01-07")
			expect(data[6].y).to.eql(0)
		})
		it('Should build labels in monthly increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-06-10 15:00:00")
			const increment = new Increment(1, 'month')
			const rawData = new Map<string, number>()
			rawData.set("2024-02-01", 10)
			rawData.set("2024-05-01", 1)
			rawData.set("2024-06-01", 20)
			const data = chartService.buildGraphDataPoints(startDate, endDate, increment, rawData)
			expect(data.length).to.eql(6)
			expect(data[0].x).to.eql("2024-01-01")
			expect(data[0].y).to.eql(0)
			expect(data[1].x).to.eql("2024-02-01")
			expect(data[1].y).to.eql(10)
			expect(data[2].x).to.eql("2024-03-01")
			expect(data[2].y).to.eql(0)
			expect(data[3].x).to.eql("2024-04-01")
			expect(data[3].y).to.eql(0)
			expect(data[4].x).to.eql("2024-05-01")
			expect(data[4].y).to.eql(1)
			expect(data[5].x).to.eql("2024-06-01")
			expect(data[5].y).to.eql(20)
		})
	})
	describe('getConfigurationSettings tests', () => {
		it('Should get correct settings for a days difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-01-02")
			const result = chartService.getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.not.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("hour")
			expect(result.xAxisSettings.tooltipFormat).to.eql("hA")
			expect(result.xAxisSettings.unit).to.eql("hour")
		})
		it('Should get correct settings for 6 days difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-01-07")
			const result = chartService.getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("day")
			expect(result.xAxisSettings.tooltipFormat).to.eql("dddd Do MMMM")
			expect(result.xAxisSettings.unit).to.eql("day")
		})
		it('Should get correct settings for 2 months difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-03-01")
			const result = chartService.getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("month")
			expect(result.xAxisSettings.tooltipFormat).to.eql("MMMM YYYY")
			expect(result.xAxisSettings.unit).to.eql("month")
		})
	})
})
