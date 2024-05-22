import {ManipulateType} from 'dayjs'

export class Increment {
	constructor(public amount: number, public unit: ManipulateType) {
		this.amount = amount
		this.unit = unit
	}
}
