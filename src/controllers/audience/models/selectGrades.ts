import {IsNotEmpty} from 'class-validator'
import {Transform} from 'class-transformer'
import {transformStringArray} from '../../../utils/transformUtils'
import {SubmittableForm} from '../../models/submittableForm'
import {Grade} from '../../../csrs/model/profile'

export class SelectGrades extends SubmittableForm {
	public grades?: Grade[]

	@IsNotEmpty({
		message: 'audience.validation.grades.empty'
	})
	@Transform(transformStringArray)
	public codes: string[]

	public allGrades: string

	constructor(grades?: Grade[]) {
		super()
		this.grades = grades
		this.allGrades = (grades || []).map(h => h.code).join(",")
	}

	getCodes() {
		return (this.codes.length === 1 && this.codes[0] === 'all') ? this.allGrades.split(",") : this.codes
	}
}