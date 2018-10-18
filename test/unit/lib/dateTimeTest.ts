import {beforeEach, describe, it} from 'mocha'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {DateTime} from '../../../src/lib/dateTime'
import {expect} from 'chai'

chai.use(sinonChai)

describe('Tests for dateTime', () => {
	beforeEach(() => {})

	it('should return date with month as text', () => {
		const date = '2020-02-01'

		const response = DateTime.convertDate(date)

		expect(response).to.equal('1 February 2020')
	})
})
