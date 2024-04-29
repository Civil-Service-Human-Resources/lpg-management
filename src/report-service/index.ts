import {DateStartEnd} from '../learning-catalogue/model/dateStartEnd'
import {ReportServiceClient} from './reportServiceClient'
import {CourseService} from 'lib/courseService'
import {BasicCourse, ChooseCoursesModel} from '../controllers/reporting/model/chooseCoursesModel'
import {CsrsService} from '../csrs/service/csrsService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {Report} from '../controllers/reporting/Report'

export class ReportService {

	constructor(private client: ReportServiceClient, private courseService: CourseService,
				private csrsService: CsrsService, private organisationalUnitService: OrganisationalUnitService) {
	}

	async getReport(reportType: Report, dateRange: DateStartEnd): Promise<Buffer> {
		let report = ""
		switch (reportType) {
			case Report.LEARNER_RECORD: {
				report = await this.client.getReportLearnerRecord(dateRange)
				break
			}
			case Report.BOOKING: {
				report = await this.client.getReportBookingInformation(dateRange)
				break
			}
		}
		return Buffer.from(report, 'binary')
	}

	async getChooseCoursePage(): Promise<ChooseCoursesModel> {
		const userOrganisation = (await this.csrsService.getCivilServant()).organisationalUnit
		const hierarchy = await this.organisationalUnitService.getOrgHierarchy(userOrganisation.id)
		const departmentCodes = hierarchy.map(o => o.code)
		const requiredLearningResponse = await this.courseService.getRequiredLearning(departmentCodes)
		const requiredLearning: BasicCourse[] = requiredLearningResponse.results
			.map(c => new BasicCourse(c.id, c.title))
		return new ChooseCoursesModel(userOrganisation.name, requiredLearning)
	}
}
