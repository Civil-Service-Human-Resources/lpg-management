import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {describe} from 'mocha'
import {DurationService} from '../../../src/lib/durationService'
import {Duration} from 'moment'
import moment = require('moment')

chai.use(sinonChai)

describe('FrequencyService', () => {
	describe('formatDuration', () => {
		it('should output "12 years, 2 months, 1 day" for frequency string "P12Y2M1D"', () => {
			const frequency: Duration = moment.duration('P12Y2M1D')
			expect(DurationService.formatDuration(frequency)).to.be.equal('12 years, 2 months, 1 day')
		})

		it('should output "12 years, 1 day" for frequency string "P12Y1D"', () => {
			const frequency: Duration = moment.duration('P12Y1D')
			expect(DurationService.formatDuration(frequency)).to.be.equal('12 years, 1 day')
		})
	})
})
