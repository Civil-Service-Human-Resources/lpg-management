import {NextFunction, Request, Response, Router} from 'express'
import {ReportService} from '../report-service'
import moment = require('moment')
import {DateStartEndCommandFactory} from './command/factory/dateStartEndCommandFactory'
import {DateStartEndCommand} from './command/dateStartEndCommand'
import {DateStartEnd} from '../learning-catalogue/model/dateStartEnd'
import {Validator} from '../learning-catalogue/validator/validator'
import {PlaceholderDate} from '../learning-catalogue/model/placeholderDate'
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

			if(currentUser){
				if(!currentUser.isMVPReporter()){
					response.render("page/unauthorised")
				}

				let civilServant = await this.csrsService.getCivilServant()
				let organisationName = civilServant.organisationalUnit.name

				let organisationsForTypeahead = await this.getOrganisationalUnitsForUser(currentUser)
				
				let userCanAccessMultipleOrganisations: boolean = organisationsForTypeahead.length > 1

				response.render('page/reporting/choose-organisation', {
					organisationName: organisationName,
					organisationListForTypeAhead: organisationsForTypeahead,
					showTypeaheadOption: userCanAccessMultipleOrganisations
				})
			}
			else {
				response.render("page/error")
			}
			
		}
	}

	submitOrganisationSelection(){
		return async(request: Request, response: Response) => {
			let user = request.user

			if(user){
				if(!user.isMVPReporter()){
					response.render("page/unauthorised")
				}
				else {
					let selectedOrganisationId = request.body.organisationId

					let organisationalUnitsForUser = await this.getOrganisationalUnitsForUser(user)
					let organisationIdsForUser = organisationalUnitsForUser.map(org => org.id)
					console.log(organisationIdsForUser)
					let userCanAccessOrganisation = organisationIdsForUser.includes(selectedOrganisationId)

					if(!userCanAccessOrganisation){
						response.render("page/unauthorised")
					}
					else{
						response.redirect(`/reporting/course-completions?organisationId=${selectedOrganisationId}`)
					}

					
				}

				
			}
			else{
				response.render("page/error")	
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
				request.session!.sessionFlash = {errors}
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
				request.session!.sessionFlash = {errors}
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

	private async getOrganisationalUnitsForUser(user: any){
		let organisationList = await this.csrsService.listOrganisationalUnitsForTypehead()
		let organisationsForTypeahead = organisationList.typeahead

		if(!user.isUnrestrictedOrganisation()){
			let userDomain = user.username.split("@")[1]
			organisationsForTypeahead = organisationsForTypeahead.filter((org) => org.domains.map(domain => domain.domain).includes(userDomain))
		}

		return organisationsForTypeahead
	}
}
