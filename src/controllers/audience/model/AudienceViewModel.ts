import {Audience} from '../../../learning-catalogue/model/audience'
import {plainToInstance} from 'class-transformer'

export class AudienceViewModel extends Audience {
	departmentsAsNames: string[]

	setDepartmentNames(codeToNameMap: any) {
		this.departmentsAsNames = (this.departments || [])
			.map(d => codeToNameMap[d])
			.sort()
	}

	public static fromAudience(a: Audience) {
		return plainToInstance(AudienceViewModel, a)
	}
}
