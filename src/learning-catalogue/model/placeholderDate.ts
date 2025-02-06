import moment = require('moment')

export class PlaceholderDate {
	public endDate: moment.Moment
	public startDate: moment.Moment
	constructor() {
		this.endDate = moment()
		this.startDate = moment()
	}
}
