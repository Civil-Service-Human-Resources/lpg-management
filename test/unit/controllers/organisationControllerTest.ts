import {beforeEach, describe, it} from 'mocha'
import {mockReq, mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {NextFunction, Request, Response} from 'express'
import * as sinon from 'sinon'
import {OrganisationController} from '../../../src/controllers/organisationalUnit/organisationController'
import {OrganisationalUnit} from '../../../src/csrs/model/organisationalUnit'
import {PageResults} from '../../../src/learning-catalogue/model/pageResults'
import {Validator} from '../../../src/learning-catalogue/validator/validator'
import {OrganisationalUnitService} from '../../../src/csrs/service/organisationalUnitService'
import { OrganisationalUnitPageModel } from '../../../src/csrs/model/organisationalUnitPageModel'
import { OrganisationalUnitPageModelFactory } from '../../../src/csrs/model/organisationalUnitPageModelFactory'

chai.use(sinonChai)

describe('Organisation Controller Tests', function() {
	let organisationController: OrganisationController
	let factory: OrganisationalUnitPageModelFactory
	let validator: Validator<OrganisationalUnitPageModel>
	let organisationalService: OrganisationalUnitService

	let req: Request
	let res: Response
	let next: NextFunction

	beforeEach(() => {
		factory = <OrganisationalUnitPageModelFactory>{}
		validator = <Validator<OrganisationalUnitPageModel>>{}
		organisationalService = <OrganisationalUnitService>{}
		organisationController = new OrganisationController(validator, factory, organisationalService)

		req = mockReq()
		res = mockRes()
		next = sinon.stub()

		req.session!.save = callback => {
			callback(undefined)
		}
	})

	it('should call manage organisations page with organisations list', async function() {
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()

		const orgUnits: OrganisationalUnit[] = [organisationalUnit]

		const getOrganisations: (request: Request, response: Response, next: NextFunction) => void = organisationController.getOrganisationList()

		let listOrganisationalUnits = sinon.stub().returns(Promise.resolve(orgUnits))
		organisationalService.getOrgTree = listOrganisationalUnits

		await getOrganisations(req, res, next)

		expect(res.render).to.have.been.calledOnceWith('page/organisation/manage-organisations', {organisationalUnits: orgUnits})
	})

	it('should call organisation overview page with organisation', async function() {
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id == 1

		const getOrganisation: (request: Request, response: Response) => void = organisationController.organisationOverview()

		let getOrganisationalUnit = sinon.stub().returns(Promise.resolve(organisationalUnit))
		organisationalService.getOrganisation = getOrganisationalUnit

		await getOrganisation(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/organisation/organisation-overview')
	})

	it('should call organisation page with organisations typeahead list', async function() {
		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()

		const pageResults: PageResults<OrganisationalUnit> = {
			page: 0,
			size: 10,
			totalResults: 10,
			results: [organisationalUnit],
		} as PageResults<OrganisationalUnit>

		const addOrganisation: (request: Request, response: Response) => void = organisationController.addEditOrganisation()

		let listOrganisationalUnitsForTypehead = sinon.stub().returns(Promise.resolve(pageResults))
		organisationalService.getOrgDropdown = listOrganisationalUnitsForTypehead

		await addOrganisation(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/organisation/add-edit-organisation')
	})

	it('should check for organisation errors and redirect to manage organisation page if no errors', async function() {
		const errors = {fields: [], size: 0}
		const organisation = new OrganisationalUnit()
		organisation.id = 123
		organisation.name = 'New organisation'

		factory.create = sinon.stub().returns(organisation)
		validator.check = sinon.stub().returns({fields: [], size: 0})
		organisationalService.createOrganisationalUnit = sinon.stub().returns(organisation)
		organisationalService.getOrgDropdown = sinon.stub()

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

		validator.check = sinon.stub().returns(errors)
		organisationalService.createOrganisationalUnit = sinon.stub().returns('123')

		const createOrganisation = organisationController.createOrganisation()
		await createOrganisation(req, res)

		expect(validator.check).to.have.been.calledWith(req.body, ['all'])
		expect(validator.check).to.have.returned(errors)
		expect(res.redirect).to.have.been.calledWith('/content-management/organisations')
	})

	it('should check for organisation errors and redirect to add organisation page if error caught', async function() {
		const validationErrors = {fields: [], size: 0}
		const errors = {fields: {fields: ['organisations.validation.organisation.alreadyExists'], size: 1}}

		const organisation = new OrganisationalUnit()
		organisation.name = 'New organisation'

		factory.create = sinon.stub().returns(organisation)
		organisationalService.createOrganisationalUnit = sinon.stub().throwsException(new Error())
		validator.check = sinon.stub().returns(validationErrors)

		const createOrganisation = organisationController.createOrganisation()
		await createOrganisation(req, res)

		expect(req.session!.sessionFlash).to.eql({errors: errors})
		expect(res.redirect).to.have.been.calledWith('/content-management/organisations')
	})

	//
	it('should check for organisation errors when updating and redirect to manage organisation page if no errors', async function() {
		const errors = {fields: [], size: 0}
		const organisation = new OrganisationalUnit()
		organisation.id = 123
		organisation.name = 'New organisation'

		res.locals.organisationalUnit = organisation

		factory.create = sinon.stub().returns(organisation)
		validator.check = sinon.stub().returns({fields: [], size: 0})
		organisationalService.updateOrganisationalUnit = sinon.stub().returns(organisation)
		organisationalService.getOrgDropdown = sinon.stub()

		const updateOrganisation = organisationController.updateOrganisation()
		await updateOrganisation(req, res)

		expect(validator.check).to.have.been.calledWith(req.body, ['all'])
		expect(validator.check).to.have.returned(errors)
		expect(res.redirect).to.have.been.calledWith(`/content-management/organisations/${organisation.id}/overview`)
	})

	it('should check for organisation errors when updating and redirect to organisation page if errors', async function() {
		const errors = {
			fields: ['validation.organisations.name.empty'],
			size: 1,
		}
		const organisation = new OrganisationalUnit()
		organisation.name = 'New organisation'
		organisation.id = 123
		req.params.organisationId = organisation.id.toString()

		validator.check = sinon.stub().returns(errors)
		organisationalService.updateOrganisationalUnit = sinon.stub().returns('123')

		const updateOrganisation = organisationController.updateOrganisation()
		await updateOrganisation(req, res)

		expect(validator.check).to.have.been.calledWith(req.body, ['all'])
		expect(validator.check).to.have.returned(errors)
		expect(res.redirect).to.have.been.calledWith(`/content-management/organisations/:organisationalUnitId`)
	})

	it('should check for organisation errors when updating and redirect to add organisation page if error caught', async function() {
		const validationErrors = {fields: [], size: 0}
		const errors = {fields: {fields: ['organisations.validation.organisation.alreadyExists'], size: 1}}

		const organisation = new OrganisationalUnit()
		organisation.name = 'New organisation'
		organisation.id = 123
		res.locals.organisationalUnit = organisation
		req.params.organisationId = organisation.id.toString()

		factory.create = sinon.stub().returns(organisation)
		organisationalService.updateOrganisationalUnit = sinon.stub().throwsException(new Error())
		validator.check = sinon.stub().returns(validationErrors)

		const updateOrganisation = organisationController.updateOrganisation()
		await updateOrganisation(req, res)

		expect(req.session!.sessionFlash).to.eql({errors: errors})
		expect(res.redirect).to.have.been.calledWith(`/content-management/organisations/${organisation.id}`)
	})

	it('should check for render confirm delete page', async function() {
		const confirmDelete: (request: Request, response: Response) => void = organisationController.confirmDelete()

		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id = 1
		res.locals.organisationalUnit = organisationalUnit

		await confirmDelete(req, res)

		expect(res.render).to.have.been.calledOnceWith('page/organisation/delete-organisation')
	})

	it('should call delete organisation on csrs and redirect to organisations page', async function() {
		const deleteOrganisation: (request: Request, response: Response) => void = organisationController.deleteOrganisation()

		const organisationalUnit: OrganisationalUnit = new OrganisationalUnit()
		organisationalUnit.id = 1
		res.locals.organisationalUnit = organisationalUnit

		organisationalService.deleteOrganisationalUnit = sinon.stub()

		await deleteOrganisation(req, res)

		expect(organisationalService.deleteOrganisationalUnit).to.have.been.calledOnceWith(organisationalUnit.id)
		expect(res.redirect).to.have.been.calledOnceWith('/content-management/organisations/manage')
	})
})
