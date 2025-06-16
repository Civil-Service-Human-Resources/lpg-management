import {getLogger} from '../../utils/logger'
import {NextFunction, Request, Response} from 'express'
import {CompoundRoleBase, UserRole} from '../../identity/identity'

const logger  = getLogger("roleCheck")

export const roleCheckMiddleware = (role: UserRole) => (req: Request, res: Response, next: NextFunction) => {
	return compoundRoleCheckMiddleware(role.compoundRoles)(req, res, next)
}

export const compoundRoleCheckMiddleware = (requiredRoles: CompoundRoleBase[]) => (req: Request, res: Response, next: NextFunction) => {
	let errorMsg: string = ""
	if (req.user) {
		const userRoles: string[] = req.user.roles
		const requiredRoleDescriptions = requiredRoles.map(r => r.getDescription()).join(" ")
		logger.debug(`Checking user '${req.user.uid}' against required roles ${requiredRoleDescriptions}`)
		if (!requiredRoles.every(rr => rr.checkRoles(userRoles))) {
			errorMsg = `User '${req.user.uid}' does not have the correct roles assigned for URL ${req.originalUrl}. User has roles: [${userRoles}], required Roles are: ` + requiredRoleDescriptions
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
