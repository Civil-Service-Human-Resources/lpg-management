import {plainToInstance} from 'class-transformer'
import {ChooseOrganisationsModel} from './model/chooseOrganisationsModel'
import {Request, Response} from 'express'
import {ReportService} from '../../report-service'
import {IOrganisationSession} from './model/IOrganisationSession'

export class OrganisationPageModelService {

	constructor(private reportService: ReportService) {
	}

	async renderChooseOrganisation(request: Request) {
		return await this.reportService.getChooseOrganisationPage(request.user)
	}

	async chooseOrganisations<T extends IOrganisationSession>(request: Request, response: Response, session: T): Promise<T> {
		let currentUser = request.user
		const pageModel = plainToInstance(ChooseOrganisationsModel, response.locals.input as ChooseOrganisationsModel)
		const selectedOrganisationIds = pageModel.getSelectedOrganisationIds()
		const selectedOrganisations = selectedOrganisationIds ? (await this.reportService.getOrganisationsForUser(currentUser))
			.filter(o => selectedOrganisationIds.includes(o.id)) : undefined
		session.organisationFormSelection = pageModel.organisation
		session.selectedOrganisations = selectedOrganisations
		return session
	}

}
