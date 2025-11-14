import {Exclude, Transform} from 'class-transformer'
import {
	ArrayNotEmpty,
	IsArray, IsNotEmpty,
	Matches,
	Max,
	Min, ValidateIf,
} from 'class-validator'
import {SubmittableForm} from '../../models/submittableForm'
import {IsValidDomain} from '../../../validators/isValidDomain'

export class EditAgencyToken extends SubmittableForm {

	// settings
	public tokenExists: boolean
	public organisationId: number

	// input attributes
	@ValidateIf(o => o.domainToAdd !== undefined, {groups: ['addDomain']})
	@IsValidDomain({
		message: 'domains.validation.domains.invalidFormat',
		groups: ['addDomain']
	})
	@IsNotEmpty({
		message: 'domains.validation.domains.empty',
		groups: ['addDomain']
	})
	@Transform(({value}) => { return value.toLowerCase() })
	public domainToAdd?: string

	@Transform(({value}) => {
		return parseInt(value)
	})
	@IsNotEmpty({
		message: 'agencyToken.validation.capacity.required',
		groups: ['all']
	})
	@Min(1, {
		message: 'agencyToken.validation.capacity.invalid',
		groups: ['all']
	})
	@Max(5000, {
		message: 'agencyToken.validation.capacity.invalid',
		groups: ['all']
	})
	public capacity: number

	@IsArray({
		message: 'agencyToken.validation.domains.invalid',
		groups: ['all']
	})
	@Transform(({value}) => {
		if (typeof value === "string") {
			return [value]
		} else {
			return [...value]
		}
	})
	@ArrayNotEmpty({
		message: 'agencyToken.validation.domains.empty',
		groups: ['all']
	})
	public domain: string[] = []

	@Matches(/^[A-Z0-9]+$/, {
		message: 'agencyToken.validation.token.invalidFormat',
		groups: ['all']
	})
	public token: string

	// data
	@Exclude()
	public capacityUsed: number

	constructor(organisationId: number, tokenExists: boolean, domain: string[], capacity: number, capacityUsed: number, token: string) {
		super()
		this.organisationId = organisationId
		this.tokenExists = tokenExists
		this.domain = domain
		this.capacity = capacity
		this.capacityUsed = capacityUsed
		this.token = token
	}

	validateAddDomain(model: EditAgencyToken, domainToRemove?: string) {
		this.errors = model.errors
		if (this.errors !== undefined) {
			this.domainToAdd = model.domainToAdd
		} else {
			if (domainToRemove !== undefined) {
				this.domain = this.domain.filter(d => d !== domainToRemove)
			} else if (model.domainToAdd) {
				if (this.domain.includes(model.domainToAdd)) {
					this.addError({addDomain: ['domains.validation.domains.alreadyExists']})
				} else {
					this.domain.push(model.domainToAdd)
				}
			}
			this.domain.sort()
		}
	}

	validateAndUpdateWithEditAgencyTokenModel(model: EditAgencyToken) {
		this.errors = model.errors
		if (this.errors !== undefined) {
			this.capacity = model.capacity
		} else {
			this.capacity = model.capacity
			this.token = model.token
			if (this.capacity < this.capacityUsed) {
				this.addError({capacity: ['agencyToken.validation.capacity.lessThanCurrentUsage']})
			}
		}
	}
}
