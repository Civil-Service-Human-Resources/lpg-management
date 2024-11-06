import {NextFunction, Request, Response, Handler} from 'express'
import {PassportStatic} from 'passport'
import * as oauth2 from 'passport-oauth2'
import * as jwt from 'jsonwebtoken'
import {createIdentity, Identity, IdentityDetails} from './identity'
import {AuthConfig} from './authConfig'
import { getLogger } from '../utils/logger'
import {plainToInstance} from 'class-transformer'
import {CivilServantProfileService} from '../csrs/service/civilServantProfileService'

const logger = getLogger("Auth")

export class Auth {
	readonly REDIRECT_COOKIE_NAME: string = 'redirectTo'
	readonly HTTP_UNAUTHORISED: number = 401

	logger = getLogger('Auth')
	currentUser: Identity

	constructor(
		private config: AuthConfig,
		private passportStatic: PassportStatic,
		private civilServantProfileService: CivilServantProfileService,
		private lpgUiUrl: string) { }

	configure(app: any) {
		app.use(this.initialize())
		app.use(this.session())

		this.configureStrategy()

		app.all(this.config.authenticationPath, this.authenticate(), this.redirect())

		app.use(this.checkAuthenticatedAndAssignCurrentUser())
		app.use(this.addToResponseLocals())
		app.use(this.hasAdminRole())
		app.use(this.logOutMiddleware())
	}

	initialize(): Handler {
		return this.passportStatic.initialize()
	}

	session(): Handler {
		return this.passportStatic.session()
	}

	configureStrategy() {
		let strategy: oauth2.Strategy
		strategy = new oauth2.Strategy(
			{
				authorizationURL: `${this.config.authenticationServiceUrl}${this.config.authorizationPath}`,
				callbackURL: `${this.config.callbackUrl}/authenticate`,
				clientID: this.config.clientId,
				clientSecret: this.config.clientSecret,
				tokenURL: `${this.config.authenticationServiceUrl}${this.config.authTokenPath}`

			},
			this.verify()

		)

		this.passportStatic.use(strategy)

		this.passportStatic.serializeUser((user: any, done: any) => {
			done(null, JSON.stringify(user))
		})

		this.passportStatic.deserializeUser<Identity, string>(this.deserializeUser())
	}

	verify() {
		return async (accessToken: string, refreshToken: string, profile: any, cb: oauth2.VerifyCallback) => {
			try {
				const token = jwt.decode(accessToken) as any
				const identityDetails = new IdentityDetails(token.user_name, token.email, token.authorities, accessToken)
				const csrsProfile = await this.civilServantProfileService.getProfile(identityDetails.uid, identityDetails.accessToken)
				if (csrsProfile.shouldRefresh) {
					await this.civilServantProfileService.fetchNewProfile(identityDetails.accessToken)
				}
				cb(null, identityDetails)
			} catch (e) {
				this.logger.warn(`Error retrieving user profile information`, e)
				cb(e)
			}
		}
	}

	checkAuthenticatedAndAssignCurrentUser() {
		return (req: Request, res: Response, next: NextFunction) => {
			if (req.isAuthenticated()) {
				const user = req.user as Identity
				if (!user.isProfileComplete()) {
					logger.info(`User ${user.username} hasn't completed profile setup - redirecting to UI`)
					return res.redirect(this.lpgUiUrl)
				}
				this.currentUser = user
				return next()
			}

			res.cookie(this.REDIRECT_COOKIE_NAME, req.originalUrl)
			return this.passportStatic.authenticate('oauth2', {
				failureFlash: true,
				failureRedirect: '/',
			})(req, res, next)
		}
	}

	logOutMiddleware() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const user = req.user as Identity
			 if (user.managementShouldLogout) {
				await this.logout()(req, res)
			} else {
				next()
			}
		}
	}

	authenticate() {
		return this.passportStatic.authenticate('oauth2', {
			failureFlash: true,
			failureRedirect: '/',
		})
	}

	redirect() {
		return (req: Request, res: Response) => {
			const redirect = req.cookies[this.REDIRECT_COOKIE_NAME]
			if (!redirect) {
				this.logger.info('Passport session not present on express request - redirecting to root')
				res.redirect('/')
				return
			}
			delete req.cookies[this.REDIRECT_COOKIE_NAME]
			res.redirect(redirect)
		}
	}

	deserializeUser() {
		return async (data: string, done: any) => {
			let identity: IdentityDetails
			try {
				identity = plainToInstance(IdentityDetails, JSON.parse(data) as IdentityDetails)
				const csrsProfile = await this.civilServantProfileService.getProfile(identity.uid, identity.accessToken)
				if (!csrsProfile.managementLoggedIn) {
					csrsProfile.managementLoggedIn = true
					await this.civilServantProfileService.updateProfileCache(csrsProfile)
				}
				const user = createIdentity(identity, csrsProfile)
				done(null, user)
			} catch (error) {
				this.logger.error(`Problem deserializing: ${error}`)
				done(error, undefined)
			}
		}
	}

	addToResponseLocals() {
		return (req: Request, res: Response, next: NextFunction) => {
			res.locals.isAuthenticated = req.isAuthenticated()
			res.locals.identity = req.user
			next()
		}
	}

	hasAdminRole() {
		return (req: Request, res: Response, next: NextFunction) => {
			if (req.isAuthenticated()) {
				if (req.user && req.user.hasAnyAdminRole()) {
					return next()
				} else {
					if (req.user && req.user.uid) {
						this.logger.error('Rejecting non-admin user ' + req.user.uid + ' with IP '
							+ req.ip + ' from page ' + req.originalUrl)
					}
					req.logout()
					res.cookie(this.REDIRECT_COOKIE_NAME, this.lpgUiUrl)
					res.locals.lpgUiUrl = this.lpgUiUrl
					return res.redirect(this.lpgUiUrl.toString())
				}
			} else {
				res.cookie(this.REDIRECT_COOKIE_NAME, this.lpgUiUrl)
				res.locals.lpgUiUrl = this.lpgUiUrl
				return res.redirect(this.lpgUiUrl.toString())
			}
		}
	}

	logout() {
		return async (req: Request, res: Response) => {
			if (req.isAuthenticated()) {
				const user: Identity = plainToInstance(Identity, req.user)
				const redirectTo = user.uiLoggedIn ? `${this.lpgUiUrl}/sign-out` : this.config.getLogoutEndpoint()
				await this.civilServantProfileService.removeProfileFromCache(user.uid)
				return req.session!.destroy(() => {
					res.redirect(redirectTo)
				})
			} else {
				return res.redirect(this.lpgUiUrl.toString())
			}
		}
	}
}
