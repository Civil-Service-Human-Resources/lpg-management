import {
	buildLabels,
	convertRawDataToTable,
	getConfigurationSettings,
	Increment,
	mapLabelsToDataTable,
} from '../chart/funcs'
import dayjs from 'dayjs'
import {expect} from 'chai'


describe('ChartJS implementation tests', () => {
	describe('buildLabels tests', () => {
		it('Should build labels in hourly increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-01-01 15:00:00")
			const increment = new Increment(1, 'hour')
			const labels = buildLabels(startDate, endDate, increment)
			expect(labels.length).to.eql(16)
		})
		it('Should build labels in daily increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-01-10 15:00:00")
			const increment = new Increment(1, 'day')
			const labels = buildLabels(startDate, endDate, increment)
			expect(labels.length).to.eql(11)
		})
		it('Should build labels in monthly increments', () => {
			const startDate = dayjs("2024-01-01 15:40:00")
			const endDate = dayjs("2024-12-10 15:00:00")
			const increment = new Increment(1, 'month')
			const labels = buildLabels(startDate, endDate, increment)
			expect(labels.length).to.eql(13)
		})
	})
	describe('getConfigurationSettings tests', () => {
		it('Should get correct settings for a days difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-01-02")
			const result = getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.not.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("hour")
			expect(result.xAxisSettings.tooltipFormat).to.eql("ha")
			expect(result.xAxisSettings.unit).to.eql("hour")
		})
		it('Should get correct settings for 6 days difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-01-07")
			const result = getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("day")
			expect(result.xAxisSettings.tooltipFormat).to.eql("eeee d MMMM")
			expect(result.xAxisSettings.unit).to.eql("day")
		})
		it('Should get correct settings for 17 days difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-01-18")
			const result = getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.eql(endDate)
			expect(result.increment.amount).to.eql(3)
			expect(result.increment.unit).to.eql("day")
			expect(result.xAxisSettings.tooltipFormat).to.eql("d MMMM yyyy")
			expect(result.xAxisSettings.unit).to.eql("day")
		})
		it('Should get correct settings for 2 months difference', () => {
			const startDate = dayjs("2024-01-01")
			const endDate = dayjs("2024-03-01")
			const result = getConfigurationSettings(startDate, endDate)
			expect(result.startDate).to.eql(startDate)
			expect(result.endDate).to.eql(endDate)
			expect(result.increment.amount).to.eql(1)
			expect(result.increment.unit).to.eql("month")
			expect(result.xAxisSettings.tooltipFormat).to.eql("d MMMM yyyy")
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
			const result = convertRawDataToTable(rawDataPoints)
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
			const result = mapLabelsToDataTable(labels, tableData)
			expect(result[0]).to.eql({x: 1, y: 10})
			expect(result[1]).to.eql({x: 2, y: 0})
			expect(result[2]).to.eql({x: 3, y: 30})
			expect(result[3]).to.eql({x: 4, y: 0})
		})
	})
})