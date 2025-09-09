import {plainToInstance} from 'class-transformer'
import {ChooseOrganisationsModel} from './model/chooseOrganisationsModel'
import {Request, Response} from 'express'
import {ChooseOrganisationSession} from './model/chooseOrganisationSession'
import {FormattedOrganisation} from '../../csl-service/model/FormattedOrganisation'
import {CslService} from '../../csl-service/service/cslService'

export class OrganisationPageModelService {

	constructor(private cslService: CslService) {
	}

	async renderChooseOrganisation(request: Request) {
		const user = request.user!
		const formattedOtherOrganisations = await this.getOrganisationsForUser(user)
		const pageModel = new ChooseOrganisationsModel({
			name: user.organisationalUnit.name,
			id: user.organisationalUnit.id
		}, formattedOtherOrganisations)
		pageModel.showWholeCivilServiceOption = user.isReportingAllOrganisations()
		return pageModel
	}

	async getOrganisationsForUser(user: any): Promise<FormattedOrganisation[]> {
		return await this.cslService.getOrganisationTypeaheadForUser(user)
	}

	async handleSubmit(req: Request, res: Response, session: ChooseOrganisationSession) {
		let currentUser = req.user
		const pageModel = plainToInstance(ChooseOrganisationsModel, res.locals.input as ChooseOrganisationsModel)
		const selectedOrganisationIds = pageModel.getSelectedOrganisationIds()
		const selectedOrganisations = selectedOrganisationIds ? (await this.getOrganisationsForUser(currentUser))
			.filter(o => selectedOrganisationIds.includes(o.id)) : undefined
		session.organisationFormSelection = pageModel.organisation
		session.selectedOrganisations = selectedOrganisations
		if (!session.hasSelectedOrganisations()) {
			const errors = {fields: {organisation: ["reporting.validation.organisations.minimumOrganisations"]}, size: 1}
			req.session!.sessionFlash = {
				errors,
			}
			req.session!.save(() => {
				res.redirect('/reporting/course-completions/choose-organisation')
			})
		}
	}

}
