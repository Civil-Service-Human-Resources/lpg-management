import {DateStartEnd} from '../learning-catalogue/model/dateStartEnd'
import {ReportServiceClient} from './reportServiceClient'
import {CourseService} from 'lib/courseService'
import {OrganisationalUnitService} from '../csrs/service/organisationalUnitService'
import {Report} from '../controllers/reporting/Report'
import {BasicCourse, ChooseCoursesModel} from '../controllers/reporting/model/chooseCoursesModel'

export class ReportService {

	constructor(private client: ReportServiceClient, private courseService: CourseService,
				private organisationalUnitService: OrganisationalUnitService) {
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

	async getChooseCoursePage(selectedOrganisationId: number): Promise<ChooseCoursesModel> {
		const userOrganisation = (await this.organisationalUnitService.getOrganisation(selectedOrganisationId, true))
		const allCourses = await this.courseService.getCourseDropdown()
		const hierarchy = await this.organisationalUnitService.getOrgHierarchy(userOrganisation.id)
		const departmentCodes = hierarchy.map(o => o.code)
		const requiredLearningResponse = await this.courseService.getRequiredLearning(departmentCodes)
		const requiredLearning: BasicCourse[] = requiredLearningResponse.results
			.map(c => new BasicCourse(c.id, c.title))
		return new ChooseCoursesModel(userOrganisation.getFormattedName(), requiredLearning, allCourses)
	}

	async validateCourseSelections(courseIds: string[]) {
		const allCourseIds = (await this.courseService.getCourseDropdown()).map(c => c.value)
		return courseIds.every(id => allCourseIds.includes(id))
	}
}
