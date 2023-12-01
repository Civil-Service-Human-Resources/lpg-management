import {getLogger} from '../../utils/logger'
import {NextFunction, Request, Response} from 'express'
import {Role} from '../../identity/identity'

const logger  = getLogger("roleCheck")

export const roleCheckMiddleware = (requiredRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
	let errorMsg: string
	if (req.user) {
		const userRoles: string[] = req.user.roles
		const matchingRoles = requiredRoles.filter(r => userRoles.includes(r))
		if (matchingRoles.length === 0) {
			errorMsg = `User '${req.user.uid}' is missing one of the following required roles: [${requiredRoles}] for URL ${req.originalUrl}. User has roles: [${userRoles}]`
		} else {
			return next()
		}
	} else {
		errorMsg = `No user object found on the request for URL ${req.originalUrl}.`
	}

	logger.error(errorMsg);
	res.status(401)
	res.render('page/unauthorised');
}
