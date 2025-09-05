import {ApiParams} from 'lib/apiParams'

export class CreateReportRequestParams implements ApiParams {

	constructor(public userId: string, public fullName: string, public userEmail: string, public reportDownloadEndpoint: string,
				public selectedOrganisationIds?: number[]) {
	}

	public getAsApiParams() {
		return {
			userId: this.userId,
			fullName: this.fullName,
			userEmail: this.userEmail,
			downloadBaseUrl: this.reportDownloadEndpoint,
			selectedOrganisationIds: this.selectedOrganisationIds
		}
	}
}
