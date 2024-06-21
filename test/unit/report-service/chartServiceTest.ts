var dayjs = require('dayjs')
import {expect} from 'chai'
import {ChartService} from '../../../src/report-service/chartService'
import {Increment} from '../../../src/report-service/model/increment'

describe('ChartJS implementation tests', () => {
	const chartService = new ChartService()
	describe('buildLabels tests', () => {
		it('Should build labels in hourly increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-01-01 15:00:00")
			const increment = new Increment(1, 'hour')
			const labels = chartService.buildLabels(startDate, endDate, increment)
			expect(labels.length).to.eql(15)
		})
		it('Should build labels in daily increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-01-10 15:00:00")
			const increment = new Increment(1, 'day')
			const labels = chartService.buildLabels(startDate, endDate, increment)
			expect(labels.length).to.eql(10)
		})
		it('Should build labels in monthly increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-12-10 15:00:00")
			const increment = new Increment(1, 'month')
			const labels = chartService.buildLabels(startDate, endDate, increment)
			expect(labels.length).to.eql(12)
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
		it('Should get correct settings for 17 days difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-01-18")
			const result = chartService.getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("week")
			expect(result.xAxisSettings.tooltipFormat).to.eql("[Week commencing] Do MMMM YYYY")
			expect(result.xAxisSettings.unit).to.eql("week")
		})
		it('Should get correct settings for 2 months difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-03-01")
			const result = chartService.getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("month")
			expect(result.xAxisSettings.tooltipFormat).to.eql("MMMM yyyy")
			expect(result.xAxisSettings.unit).to.eql("month")
		})
	})
	describe('convertRawDataToTable tests', () => {
		it('should convert timezoned date strings into an epoch datatable', function() {
			const rawDataPoints = [
				{x: "2024-01-01T10:00:00Z[UTC]", y: 10},
				{x: "2024-01-03T10:00:00Z[UTC]", y: 20},
				{x: "2024-01-04T10:00:00Z[UTC]", y: 30},
				{x: "2024-01-07T10:00:00Z[UTC]", y: 40}
			]
			const result = chartService.convertRawDataToTable(rawDataPoints)
			expect(result.get(1704103200000)).to.eql(10)
			expect(result.get(1704276000000)).to.eql(20)
			expect(result.get(1704362400000)).to.eql(30)
			expect(result.get(1704621600000)).to.eql(40)
		})
	})
	describe('mapLabelsToDataTable tests', () => {
		it('should map a datatable to labels, including 0 values', function() {
			const tableData = new Map([
				[1, 10],
				[3, 30]
			])
			const labels = [1, 2, 3, 4, 5]
			const result = chartService.mapLabelsToDataPoints(labels, tableData)
			expect(result.length).to.eql(5)
			expect(result[0]).to.eql({x: 1, y: 10})
			expect(result[1]).to.eql({x: 2, y: 0})
			expect(result[2]).to.eql({x: 3, y: 30})
			expect(result[3]).to.eql({x: 4, y: 0})
			expect(result[4]).to.eql({x: 5, y: 0})
		})
	})
})
