export class FrequencyService {
	static yearMonthDayToFrequency(years: number, months: number, days: number): string {
		return `P${years}Y${months}M${days}D`
	}

	static formatFrequency(frequency: string): string {
		let outputString = ''

		const frequencyHelper: any = {
			year: FrequencyService.getYears(frequency),
			month: FrequencyService.getMonths(frequency),
			day: FrequencyService.getDays(frequency),
		}

		Object.keys(frequencyHelper).forEach(key => {
			if (frequencyHelper[key]) {
				outputString += `${outputString ? ', ' : ''}${frequencyHelper[key]} ${key}${
					Number.parseInt(frequencyHelper[key]) > 1 ? 's' : ''
				}`
			}
		})

		return outputString
	}

	static getYears(frequency: string): number {
		return FrequencyService.getPeriodElement(frequency, 'Y')
	}

	static getMonths(frequency: string): number {
		return FrequencyService.getPeriodElement(frequency, 'M')
	}

	static getDays(frequency: string): number {
		return FrequencyService.getPeriodElement(frequency, 'D')
	}

	private static getPeriodElement(frequency: string, element: string): number {
		const match = new RegExp(`(\\d+)${element}`, 'g').exec(frequency)
		return match ? Number.parseInt(match[1]) : 0
	}
}
