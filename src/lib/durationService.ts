import {Duration} from 'moment'

export class DurationService {
	static formatDuration(duration: Duration): string {
		let outputString = ''

		const durationHelper: any = {
			year: duration.years(),
			month: duration.months(),
			day: duration.days(),
		}

		Object.keys(durationHelper).forEach(key => {
			if (durationHelper[key]) {
				outputString += `${outputString ? ', ' : ''}${durationHelper[key]} ${key}${
					Number.parseInt(durationHelper[key]) > 1 ? 's' : ''
				}`
			}
		})

		return outputString
	}
}
