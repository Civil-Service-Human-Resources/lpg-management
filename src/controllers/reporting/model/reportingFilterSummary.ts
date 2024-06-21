import {FilterSummary} from '../../models/filterSummary/filterSummary'
import {OrganisationFilterSummaryRow} from './organisationFilterSummaryRow'

export class ReportingFilterSummary extends FilterSummary {
	constructor(organisations: OrganisationFilterSummaryRow) {
		super([organisations])
	}
}
