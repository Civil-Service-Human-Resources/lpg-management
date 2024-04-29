import { NextFunction, Request, Response, Router } from 'express'
import { ReportService } from '../report-service'
import moment = require('moment')
import { DateStartEndCommandFactory } from './command/factory/dateStartEndCommandFactory'
import { DateStartEndCommand } from './command/dateStartEndCommand'
import { DateStartEnd } from '../learning-catalogue/model/dateStartEnd'
import { Validator } from '../learning-catalogue/validator/validator'
import { PlaceholderDate } from '../learning-catalogue/model/placeholderDate'
import { CsrsService } from 'src/csrs/service/csrsService'
const { xss } = require('express-xss-sanitizer')


export class ReportingController {
	router: Router
	reportService: ReportService
	dateStartEndCommandFactory: DateStartEndCommandFactory
	dateStartEndCommandValidator: Validator<DateStartEndCommand>
	dateStartEndValidator: Validator<DateStartEnd>
	csrsService: CsrsService

	constructor(
		reportService: ReportService,
		dateStartEndCommandFactory: DateStartEndCommandFactory,
		dateStartEndCommandValidator: Validator<DateStartEndCommand>,
		dateStartEndValidator: Validator<DateStartEnd>,
		csrsService: CsrsService,
	) {
		this.router = Router()
		this.configureRouterPaths()
		this.reportService = reportService
		this.dateStartEndCommandFactory = dateStartEndCommandFactory
		this.dateStartEndCommandValidator = dateStartEndCommandValidator
		this.dateStartEndValidator = dateStartEndValidator
		this.csrsService = csrsService
	}

	private configureRouterPaths() {
		this.router.get('/reporting', xss(), this.getReports())

		this.router.post('/reporting/booking-information', xss(), this.generateReportBookingInformation())
		this.router.post('/reporting/learner-record', xss(), this.generateReportLearnerRecord())

		this.router.get('/reporting/course-completions/choose-organisation', xss(), this.getChooseOrganisationPage())
		this.router.post('/reporting/course-completions/choose-organisation', xss(), this.submitOrganisationSelection())
	}

	getReports() {
		return async (request: Request, response: Response) => {
			response.render('page/reporting/index', {
				placeholder: new PlaceholderDate(),
			})
		}
	}

	getChooseOrganisationPage() {
		return async (request: Request, response: Response) => {
			let currentUser = request.user

			if (currentUser && currentUser.isOrganisationReporter() && currentUser.isMVPReporter()) {
				let organisationChoices = await this.getOrganisationChoicesForUser(currentUser)
				let userCanAccessMultipleOrganisations: boolean = organisationChoices.typeaheadOrganisations.length > 1

				response.render('page/reporting/choose-organisation', {
					firstOrganisationOption: {
						name: organisationChoices.directOrganisation.name,
						id: organisationChoices.directOrganisation.id
					},
					organisationListForTypeAhead: organisationChoices.typeaheadOrganisations,
					showTypeaheadOption: userCanAccessMultipleOrganisations
				})
			}
			else {
				response.render("page/unauthorised")
			}

		}
	}

	submitOrganisationSelection() {
		return async (request: Request, response: Response) => {
			let currentUser = request.user
			let selectedOrganisationId = request.body.organisationId
			let selectedCourseIds = request.body.courseIds

			request.session.selectedOrganisationId = selectedOrganisationId
			request.session.selectedCourseIds = selectedCourseIds

			if(currentUser && currentUser.isOrganisationReporter() && currentUser.isMVPReporter() && await this.userCanSeeReportingForOrganisation(currentUser, selectedOrganisationId)){
				if(selectedCourseIds !== undefined){
					response.redirect(`/reporting/course-completions`)
				}
				else{
					response.redirect(`/reporting/course-completions/choose-courses`)
				}
				
			}
			else {
				response.render("page/unauthorised")
			}
		}
	}

	generateReportBookingInformation() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const reportType = 'Booking_information_'
			const filename = reportType.concat(moment().toISOString())

			let data = {
				...request.body,
			}

			const dateRangeCommand: DateStartEndCommand = this.dateStartEndCommandFactory.create(data)
			const dateRange: DateStartEnd = dateRangeCommand.asDateRange()

			const errors = await this.dateStartEndValidator.check(dateRange)
			if (errors.size) {
				request.session!.sessionFlash = { errors }
				request.session!.save(() => {
					response.redirect(`/reporting`)
				})
			} else {
				try {
					await this.reportService
						.getReportBookingInformation(dateRange)
						.then(report => {
							response.writeHead(200, {
								'Content-type': 'text/csv',
								'Content-disposition': `attachment;filename=${filename}.csv`,
								'Content-length': report.length,
							})
							response.end(Buffer.from(report, 'binary'))
						})
						.catch(error => {
							next(error)
						})
				} catch (error) {
					throw new Error(error)
				}
			}
		}
	}

	generateReportLearnerRecord() {
		return async (request: Request, response: Response, next: NextFunction) => {
			const reportType = 'Learner_record_'
			const filename = reportType.concat(moment().toISOString())

			let data = {
				...request.body,
			}

			const dateRangeCommand: DateStartEndCommand = this.dateStartEndCommandFactory.create(data)
			const dateRange: DateStartEnd = dateRangeCommand.asDateRange()

			const errors = await this.dateStartEndValidator.check(dateRange)

			if (errors.size) {
				request.session!.sessionFlash = { errors }
				request.session!.save(() => {
					response.redirect(`/reporting`)
				})
			} else {
				try {
					await this.reportService
						.getReportLearnerRecord(dateRange)
						.then(report => {
							response.writeHead(200, {
								'Content-type': 'text/csv',
								'Content-disposition': `attachment;filename=${filename}.csv`,
								'Content-length': report.length,
							})
							response.end(Buffer.from(report, 'binary'))
						})
						.catch(error => {
							next(error)
						})
				} catch (error) {
					throw new Error(error)
				}
			}
		}
	}

	private async getOrganisationChoicesForUser(user: any){
		return {
			directOrganisation: await this.getDirectOrganisationForCurrentCivilServant(),
			typeaheadOrganisations: await this.getOrganisationalUnitsForUser(user)
		}
	}

	private async getDirectOrganisationForCurrentCivilServant(){
		let civilServant = await this.csrsService.getCivilServant()
		let directOrganisation = civilServant.organisationalUnit
		return directOrganisation
	}

	private async userCanSeeReportingForOrganisation(user: any, organisationId: any){
		let organisationalUnitsForUser = await this.getOrganisationalUnitsForUser(user)
		let organisationIdsForUser = organisationalUnitsForUser.map(org => org.id)
		let userCanAccessOrganisation = organisationIdsForUser.includes(parseInt(organisationId))
		return userCanAccessOrganisation
	}

	private async getOrganisationalUnitsForUser(user: any) {
		let organisationList = await this.csrsService.listOrganisationalUnitsForTypehead()
		let organisationsForTypeahead = organisationList.typeahead

		if (!user.isSuperReporter()) {
			let userDomain = user.username.split("@")[1]
			organisationsForTypeahead = organisationsForTypeahead.filter((org) => org.domains.map(domain => domain.domain).includes(userDomain))
		}

		return organisationsForTypeahead
	}

	
}
