import {DateRangeCommand} from '../dateRangeCommand'

export class DateRangeCommandFactory {
	create(data: any) {
		let dateRangeCommand = new DateRangeCommand()
		dateRangeCommand.day = data.day
		dateRangeCommand.month = data.month
		dateRangeCommand.year = data.year
		dateRangeCommand.startTime = data.startTime
		dateRangeCommand.endTime = data.endTime

		return dateRangeCommand
	}
}
