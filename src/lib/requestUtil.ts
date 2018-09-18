import {Request} from 'express'

export class RequestUtil {
	static getAccessToken(request: Request): string {
		return JSON.parse(request.session!.passport.user).accessToken
	}
}


