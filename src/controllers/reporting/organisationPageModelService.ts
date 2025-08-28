import {plainToInstance} from 'class-transformer'
import {ChooseOrganisationsModel} from './model/chooseOrganisationsModel'
import {Request, Response} from 'express'
import {ReportService} from '../../report-service'
import {ChooseOrganisationSession} from './model/chooseOrganisationSession'

export class OrganisationPageModelService {

	constructor(private reportService: ReportService) {
	}

	async renderChooseOrganisation(request: Request) {
		return await this.reportService.getChooseOrganisationPage(request.user)
	}

	async handleSubmit(req: Request, res: Response, session: ChooseOrganisationSession) {
		let currentUser = req.user
		const pageModel = plainToInstance(ChooseOrganisationsModel, res.locals.input as ChooseOrganisationsModel)
		const selectedOrganisationIds = pageModel.getSelectedOrganisationIds()
		const selectedOrganisations = selectedOrganisationIds ? (await this.reportService.getOrganisationsForUser(currentUser))
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
