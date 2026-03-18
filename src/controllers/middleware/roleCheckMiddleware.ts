import {getLogger} from '../../utils/logger'
import {NextFunction, Request, Response} from 'express'
import {IUserRole} from '../../identity/identity'
import * as asyncHandler from 'express-async-handler'

const logger  = getLogger("roleCheck")

export const asyncRoleCheck = (role: IUserRole) => (req: Request, res: Response, next: NextFunction) => {
	return asyncHandler(roleCheckMiddleware(role)(req, res, next))
}

export const roleCheckMiddleware = (role: IUserRole) => (req: Request, res: Response, next: NextFunction) => {
	return compoundRoleCheckMiddleware(role)(req, res, next)
}

export const compoundRoleCheckMiddleware = (requiredRole: IUserRole) => (req: Request, res: Response, next: NextFunction) => {
	let errorMsg: string = ""
	if (req.user) {
		const userRoles: string[] = req.user.roles
		logger.debug(`Checking user '${req.user.uid}' against required roles: ${requiredRole.getDescription()}`)
		if (!requiredRole.checkRoles(userRoles)) {
			errorMsg = `User '${req.user.uid}' does not have the correct roles assigned for URL ${req.originalUrl}. User has roles: [${userRoles}], required Roles are: ` + requiredRole.getDescription()
		} else {
			return next()
		}
	} else {
		errorMsg = `No user object found on the request for URL ${req.originalUrl}.`
	}

	logger.error(errorMsg);
	res.status(401)
	return res.render('page/unauthorised');
}
