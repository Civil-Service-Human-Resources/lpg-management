import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {Request, Response} from 'express'
import * as sinon from 'sinon'
import {OrganisationController} from '../../../src/controllers/organisationController'
import {Csrs} from '../../../src/csrs/index'
import {OrganisationalUnit} from '../../../src/csrs/model/organisationalUnit'
import {PageResults} from '../../../src/learning-catalogue/model/pageResults'
import {OrganisationalUnitFactory} from '../../../src/csrs/model/organisationalUnitFactory'
import {Validator} from '../../../src/learning-catalogue/validator/validator'

chai.use(sinonChai)

describe('Organisation Controller Tests', function() {
	let organisationController: OrganisationController
	let csrs: Csrs
	let organisationalUnitFactory: OrganisationalUnitFactory
	let validator: Validator<OrganisationalUnit>

	let req: Request
	let res: Response

	beforeEach(() => {
		csrs = <Csrs>{}
		organisationalUnitFactory = <OrganisationalUnitFactory>{}
		validator = <Validator<OrganisationalUnit>>{}
		organisationController = new OrganisationController(csrs, organisationalUnitFactory, validator)

		req = mockReq()
		res = mockRes()

		req.session!.save = callback => {
			callback(undefined)
		}
	})

	it('should call manage organisations page with organisations list', async function() {
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()

		const pageResults: PageResults<OrganisationalUnit> = {
			page: 0,
			size: 10,
			totalResults: 10,
			results: [organisationalUnit],
		} as PageResults<OrganisationalUnit>

		const getOrganisations: (request: Request, response: Response) => void = organisationController.getOrganisations()

		let listOrganisationalUnits = sinon.stub().returns(Promise.resolve(pageResults))
		csrs.listOrganisationalUnits = listOrganisationalUnits

		await getOrganisations(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/organisation/manage-organisations', {organisationalUnits: pageResults})
	})

	it('should call add organisations page with organisations typeahead list', async function() {
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()

		const pageResults: PageResults<OrganisationalUnit> = {
			page: 0,
			size: 10,
			totalResults: 10,
			results: [organisationalUnit],
		} as PageResults<OrganisationalUnit>

		const addOrganisation: (request: Request, response: Response) => void = organisationController.addOrganisation()

		let listOrganisationalUnitsForTypehead = sinon.stub().returns(Promise.resolve(pageResults))
		csrs.listOrganisationalUnitsForTypehead = listOrganisationalUnitsForTypehead

		await addOrganisation(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/organisation/add-organisation')
	})

	it('should check for organisation errors and redirect to manage organisation page if no errors', async function() {
		const errors = {fields: [], size: 0}
		const organisation = new OrganisationalUnit()
		organisation.id = 'id-123'
		organisation.name = 'New organisation'

		organisationalUnitFactory.create = sinon.stub().returns(organisation)
		validator.check = sinon.stub().returns({fields: [], size: 0})
		csrs.createOrganisationalUnit = sinon.stub().returns(organisation)

		const createOrganisation = organisationController.createOrganisation()
		await createOrganisation(req, res)

		expect(validator.check).to.have.been.calledWith(req.body, ['all'])
		expect(validator.check).to.have.returned(errors)
		expect(res.redirect).to.have.been.calledWith(`/content-management/organisations/${organisation.id}/overview`)
	})

	it('should check for organisation errors and redirect to add organisation page if errors', async function() {
		const errors = {
			fields: ['validation.organisations.name.empty'],
			size: 1,
		}
		const organisation = new OrganisationalUnit()
		organisation.name = 'New organisation'

		organisationalUnitFactory.create = sinon.stub().returns(organisation)
		validator.check = sinon.stub().returns(errors)
		csrs.createOrganisationalUnit = sinon.stub().returns('123')

		const createOrganisation = organisationController.createOrganisation()
		await createOrganisation(req, res)

		expect(validator.check).to.have.been.calledWith(req.body, ['all'])
		expect(validator.check).to.have.returned(errors)
		expect(res.redirect).to.have.been.calledWith('/content-management/add-organisation')
	})
})
