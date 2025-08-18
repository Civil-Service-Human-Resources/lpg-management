import {ChooseOrganisationsModel} from '../../../../../src/controllers/reporting/model/chooseOrganisationsModel'
import {FormattedOrganisation} from '../../../../../src/csl-service/model/FormattedOrganisation'
import {expect} from 'chai'

describe('Choose organisation model tests', () => {
	const chooseOrganisationModel = new ChooseOrganisationsModel(
		{id: '1', name: "Organisation"}, [
			new FormattedOrganisation(2, 'Formatted organisation 2', 'FO2', 'FO2'),
			new FormattedOrganisation(3, 'Formatted organisation 3', 'FO3', 'FO3')
		]
	)
	describe('getSelectedOrganisationIds', () => {
		it('should return the values for the organisation search multi select when multiple-organisations' +
			' is selected', () => {
			chooseOrganisationModel.organisation = 'multiple-organisations'
			chooseOrganisationModel.organisationSearch = [2, 3]
			expect(chooseOrganisationModel.getSelectedOrganisationIds()).to.eql([2, 3])
		})
		it('should return undefined when allOrganisations is selected', () => {
			chooseOrganisationModel.organisation = 'allOrganisations'
			expect(chooseOrganisationModel.getSelectedOrganisationIds()).to.be.undefined
		})
		it('Should return the organisation selection as a number when the top radio is selected', () => {
			chooseOrganisationModel.organisation = 1
			expect(chooseOrganisationModel.getSelectedOrganisationIds()).to.eql([1])
		})
	})
})
