import {describe, it} from 'mocha'
import {expect} from 'chai'
import {HyperlinkPageModel} from '../../../../../src/controllers/learningTag/model/hyperlinkPageModel'
import {Hyperlink} from '../../../../../src/learning-catalogue/model/learningTag/hyperlink'

describe('HyperlinkPageModel tests', () => {
	it('should pass validation when no duplicates exist', () => {
		const existingLinks: Hyperlink[] = [
			Object.assign(new Hyperlink(), {id: 1, title: 'Title 1', href: 'https://url1.com'}),
			Object.assign(new Hyperlink(), {id: 2, title: 'Title 2', href: 'https://url2.com'})
		]
		const pageModel = new HyperlinkPageModel('Title 3', 'Description', 'https://url3.com')
		pageModel.validate(existingLinks)
		expect(pageModel.hasErrors()).to.be.false
	})

	it('should add error when title already exists', () => {
		const existingLinks: Hyperlink[] = [
			Object.assign(new Hyperlink(), {id: 1, title: 'Existing Title', href: 'https://url1.com'})
		]
		const pageModel = new HyperlinkPageModel('Existing Title', 'Description', 'https://url2.com')
		pageModel.validate(existingLinks)
		expect(pageModel.hasErrors()).to.be.true
		expect(pageModel.errors!.fields.title).to.deep.equal(['learningTags.validation.hyperlinks.titleAlreadyExists'])
		expect(pageModel.errors!.fields.url).to.be.undefined
	})

	it('should add error when url already exists', () => {
		const existingLinks: Hyperlink[] = [
			Object.assign(new Hyperlink(), {id: 1, title: 'Title 1', href: 'https://existing-url.com'})
		]
		const pageModel = new HyperlinkPageModel('New Title', 'Description', 'https://existing-url.com')
		pageModel.validate(existingLinks)
		expect(pageModel.hasErrors()).to.be.true
		expect(pageModel.errors!.fields.url).to.deep.equal(['learningTags.validation.hyperlinks.urlAlreadyExists'])
		expect(pageModel.errors!.fields.title).to.be.undefined
	})

	it('should add errors when both title and url already exist', () => {
		const existingLinks: Hyperlink[] = [
			Object.assign(new Hyperlink(), {id: 1, title: 'Existing Title', href: 'https://existing-url.com'})
		]
		const pageModel = new HyperlinkPageModel('Existing Title', 'Description', 'https://existing-url.com')
		pageModel.validate(existingLinks)
		expect(pageModel.hasErrors()).to.be.true
		expect(pageModel.errors!.fields.title).to.deep.equal(['learningTags.validation.hyperlinks.titleAlreadyExists'])
		expect(pageModel.errors!.fields.url).to.deep.equal(['learningTags.validation.hyperlinks.urlAlreadyExists'])
	})

	it('should ignore current hyperlink when validating edit', () => {
		const existingLinks: Hyperlink[] = [
			Object.assign(new Hyperlink(), {id: 1, title: 'Title 1', href: 'https://url1.com'}),
			Object.assign(new Hyperlink(), {id: 2, title: 'Title 2', href: 'https://url2.com'})
		]
		const pageModel = new HyperlinkPageModel('Title 1', 'Description', 'https://url1.com')
		pageModel.validate(existingLinks, 1)
		expect(pageModel.hasErrors()).to.be.false
	})
})
