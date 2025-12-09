import {OrganisationPageModelService} from './organisationPageModelService'
import {OrganisationalUnitService} from '../../csrs/service/organisationalUnitService'
import {ChooseOrganisationsModel} from './model/chooseOrganisationsModel'
import {Request} from 'express'

export class RegisteredLearnerOrganisationPageModelService extends OrganisationPageModelService {

	constructor(organisationalUnitService: OrganisationalUnitService) {
		super(organisationalUnitService)
	}

	async renderChooseOrganisation(request: Request): Promise<ChooseOrganisationsModel> {
		const pageModel = await super.renderChooseOrganisation(request);
		pageModel.showWholeCivilServiceOption = request.user!.isRegisteredLearnerAllOrganisations()
		return pageModel
	}
}
