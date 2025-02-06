import {CourseCompletionsSession} from '../../reporting/model/courseCompletionsSession'
import dayjs = require('dayjs')

export class FilterSummaryTag {
	/**
	 * On submit, the name of the input
	 */
	public formName: string
	/**
	 * On submit, the value of the input
	 */
	public formValue: string
	/**
	 * The text to display in the tag
	 */
	public tagText?: string
	/**
	 * Text to display before the tag i.e 'and'
	 */
	public preText?: string
	/**
	 * Should this tag be dismissible with an 'x' button. This will submit the form and remove the current tag
	 */
	public dismissable: boolean = false
	/**
	 * Should the form values in this tag be submittable
	 */
	public shouldSubmit: boolean = false
	constructor(formName: string, formValue: string, tagText?: string, preText?: string, dismissable: boolean = false,
				shouldSubmit: boolean = false) {
		this.formName = formName
		this.formValue = formValue
		this.tagText = tagText
		this.preText = preText
		this.dismissable = dismissable
		this.shouldSubmit = shouldSubmit
	}

}

export function getCourseSummaryTag(courseId: string, courseName: string): FilterSummaryTag {
	return new FilterSummaryTag("courseId", courseId, courseName, "and", true, false)
}

export function getMultipleCourseSummaryTags(courses: {name: string, id: string}[]): FilterSummaryTag[] {
	const tags = courses.map(course => getCourseSummaryTag(course.id, course.name))
	tags[0].preText = undefined
	return tags
}

export function getOrganisationSummaryTag(organisationName: string): FilterSummaryTag {
	return new FilterSummaryTag("", "", organisationName)
}

export function getOrganisationSummaryTags(organisationNames: string[]): FilterSummaryTag[] {
	return organisationNames.map(organisationName => getOrganisationSummaryTag(organisationName))
}

export function getDateFilterSummaryTags(period: string, periodValue: string): FilterSummaryTag {
	return new FilterSummaryTag("timePeriod", periodValue, period, undefined, false, true)
}

export function getCustomDateRangeFilterTags(session: CourseCompletionsSession): FilterSummaryTag[] {
	const startDateAsStr = dayjs(`${session.startYear}-${session.startMonth}-${session.startDay}`).format("D MMMM YYYY")
	const endDateAsStr = dayjs(`${session.endYear}-${session.endMonth}-${session.endDay}`).format("D MMMM YYYY")
	return [
		new FilterSummaryTag("timePeriod", "custom", startDateAsStr, "Between",
			false, true),
		new FilterSummaryTag("timePeriod", "custom", endDateAsStr, "and",
			false, false),
		new FilterSummaryTag("startDay", session.startDay!, undefined, undefined, false, true),
		new FilterSummaryTag("startMonth", session.startMonth!, undefined, undefined, false, true),
		new FilterSummaryTag("startYear", session.startYear!, undefined, undefined, false, true),
		new FilterSummaryTag("endDay", session.endDay!, undefined, undefined, false, true),
		new FilterSummaryTag("endMonth", session.endMonth!, undefined, undefined, false, true),
		new FilterSummaryTag("endYear", session.endYear!, undefined, undefined, false, true)
	]
}
