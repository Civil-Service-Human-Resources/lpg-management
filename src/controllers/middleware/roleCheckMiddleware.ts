import {getLogger} from '../../utils/logger'
import {NextFunction, Request, Response} from 'express'
import {CompoundRoleBase} from '../../identity/identity'

const logger  = getLogger("roleCheck")

export const roleCheckMiddleware = (requiredRoles: CompoundRoleBase[]) => (req: Request, res: Response, next: NextFunction) => {
	let errorMsg: string = ""
	if (req.user) {
		const userRoles: string[] = req.user.roles
		let hasRequiredRoles = true
		for (const requiredRole of requiredRoles) {
			if (!requiredRole.checkRoles(userRoles)) {
				errorMsg += ` ${requiredRole.getDescription()}`
				hasRequiredRoles = false
			}
		}
		if (!hasRequiredRoles) {
			errorMsg = `User '${req.user.uid}' does not have the correct roles assigned for URL ${req.originalUrl}. User has roles: [${userRoles}], required Roles are: ` + errorMsg
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
