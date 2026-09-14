import {describe, it} from 'mocha'
import {expect} from 'chai'
import {HyperlinkPageModel} from '../../../../../src/controllers/learningTag/model/hyperlinkPageModel'

describe('HyperlinkPageModel tests', () => {
	it('should create HyperlinkPageModel with given properties', () => {
		const pageModel = new HyperlinkPageModel('Title', 'Description', 'https://url.com')
		expect(pageModel.title).to.equal('Title')
		expect(pageModel.description).to.equal('Description')
		expect(pageModel.url).to.equal('https://url.com')
	})
})
