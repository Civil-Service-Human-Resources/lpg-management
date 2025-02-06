import {HttpException} from './HttpException'

export class ResourceNotFoundError extends HttpException {
	constructor(readonly url: string) {
		super(url, 404)
	}
}
