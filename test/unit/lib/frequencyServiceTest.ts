import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {describe} from 'mocha'
import {FrequencyService} from '../../../src/lib/frequencyService'

chai.use(sinonChai)

describe('FrequencyService', () => {
	describe('formatFrequency', () => {
		it('should output "12 years, 2 months, 1 day" for frequency string "P12Y2M1D"', () => {
			const frequency = 'P12Y2M1D'
			expect(FrequencyService.formatFrequency(frequency)).to.be.equal('12 years, 2 months, 1 day')
		})

		it('should output "12 years, 1 day" for frequency string "P12Y1D"', () => {
			const frequency = 'P12Y1D'
			expect(FrequencyService.formatFrequency(frequency)).to.be.equal('12 years, 1 day')
		})
	})
})
