import {Audience} from '../audience'
import {plainToInstance} from 'class-transformer'

export class AudienceFactory {
	constructor() {
		this.create = this.create.bind(this)
	}

	create(data: any) {
		return plainToInstance(Audience, data)
	}
}
