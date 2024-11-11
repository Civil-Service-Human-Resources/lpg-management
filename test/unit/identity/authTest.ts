import {describe, it} from 'mocha'
import {mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {NextFunction, Request, Response} from 'express'
import * as sinon from 'sinon'
import {expect} from 'chai'
import {PassportStatic} from 'passport'
import {Strategy} from 'passport-oauth2'
import {Auth} from '../../../src/identity/auth'
import {AuthConfig} from '../../../src/identity/authConfig'
import {Identity} from '../../../src/identity/identity'
import { CivilServantProfileService } from 'src/csrs/service/civilServantProfileService'
import {Profile} from '../../../src/csrs/model/profile'
import {OrganisationalUnit} from '../../../src/csrs/model/organisationalUnit'

chai.use(sinonChai)

describe('Auth tests', function() {
	let auth: Auth
	let passportStatic: PassportStatic = <PassportStatic>{}
	let civilServantProfileService: CivilServantProfileService = <CivilServantProfileService>{}

	const clientId = 'clientId'
	const clientSecret = 'secret'
	const authenticationServiceUrl = 'localhost:8080'
	const callbackUrl = 'http://localhost:3030'
	const authenticationPath = 'authentication-path'
	const authorizationPath = 'authorization-path'
	const authTokenPath = 'authToken-path'
	const logoutPath = 'logout-path'

	beforeEach(() => {
		const config = new AuthConfig(clientId, clientSecret, authenticationServiceUrl, callbackUrl, authenticationPath, authorizationPath, authTokenPath, logoutPath)

		auth = new Auth(config, passportStatic, civilServantProfileService, "lpgui")
	})

	it('should return next function if user is authenticated', function() {
		const authenticate: (request: Request, response: Response, next: NextFunction) => void = auth.checkAuthenticatedAndAssignCurrentUser()

		const response: Response = mockRes()
		const request: Request = <Request>{}
		request.isAuthenticated = sinon.stub().returns(true)
		const user = new Identity("uid", "username", [], "access-token")
		user.organisationalUnit = new OrganisationalUnit()
		user.fullName = "FullName"
		request.user = user

		const next: NextFunction = sinon.stub()

		authenticate(request, response, next)

		expect(next).to.have.been.calledOnce
	})

	it('should redirect if the user has not completed their profile', function() {
		const authenticate: (request: Request, response: Response, next: NextFunction) => void = auth.checkAuthenticatedAndAssignCurrentUser()

		const response: Response = mockRes()
		const request: Request = <Request>{}
		request.isAuthenticated = sinon.stub().returns(true)
		const user = new Identity("uid", "username", [], "access-token")
		user.fullName = "FullName"
		request.user = user

		const next: NextFunction = sinon.stub()

		authenticate(request, response, next)

		expect(response.redirect).to.have.been.calledOnceWith("lpgui")
	})

	it('should call passportStatic initialize', function() {
		passportStatic.initialize = sinon.stub()

		auth.initialize()

		expect(passportStatic.initialize).to.have.been.calledOnce
	})

	it('should call passportStatic session', function() {
		passportStatic.session = sinon.stub()

		auth.session()

		expect(passportStatic.session).to.have.been.calledOnce
	})

	it('should call Verify()', function() {
		const verifyCallback = auth.verify()

		const accessToken = 'access-token'
		const identity: Identity = <Identity>sinon.createStubInstance(Identity)

		const passportCallback = sinon.stub()

		verifyCallback(accessToken, 'refresh-token', null, passportCallback).then(function() {
			expect(passportCallback).to.have.been.calledOnceWith(null, identity)
		})
	})

	it('verify should catch and log errors', function() {
		const verifyCallback = auth.verify()

		const accessToken = 'access-token'

		const error: Error = new Error('Test Error')

		const passportCallback = sinon.stub()

		verifyCallback(accessToken, 'refresh-token', null, passportCallback).then(function() {
			expect(passportCallback).to.have.been.calledOnceWith(error)
		})
	})

	it('should call authenticate', function() {
		const authRet: any = {authenticated: true}
		passportStatic.authenticate = sinon
			.stub()
			.returns(authRet)
			.withArgs('oauth2', {
				failureFlash: true,
				failureRedirect: '/',
			})

		const authReturn = auth.authenticate()

		expect(passportStatic.authenticate).calledOnceWith('oauth2', {
			failureFlash: true,
			failureRedirect: '/',
		})

		expect(authReturn).to.eql(authRet)
	})

	it('should call redirect to / if redirectTo value is not present', function() {
		const redirect: (request: Request, response: Response) => void = auth.redirect()

		const response: Response = mockRes()
		const request: Request = <Request>{cookies: {}}

		redirect(request, response)

		expect(response.redirect).calledOnceWith('/')
	})

	it('should call redirect if redirectTo value is present in cookie', function() {
		const redirect: (request: Request, response: Response) => void = auth.redirect()

		const response: Response = mockRes()
		const request: Request = <Request>{cookies: {redirectTo: '/'}}

		redirect(request, response)

		expect(response.redirect).calledOnceWith('/')
		expect(request.cookies.redirectTo).to.be.undefined
	})

	it('should configure passport with serialize methods and strategy', () => {
		const deserializeUser = sinon.stub()
		const serializeUser = sinon.stub()
		const useStrategy = sinon.stub().withArgs(sinon.match.instanceOf(Strategy))

		passportStatic.deserializeUser = deserializeUser
		passportStatic.serializeUser = serializeUser
		passportStatic.use = useStrategy

		auth.configureStrategy()

		expect(passportStatic.deserializeUser).to.have.been.calledOnce
		expect(passportStatic.serializeUser).to.have.been.calledOnce
		expect(passportStatic.use).to.have.been.calledOnce
	})

	it('should deserialize json to identity when user has logged in already', () => {
		const deserializeCallback = auth.deserializeUser()
		const data: string = '{"uid": "abc123", "username": "user@domain.com", "roles": ["role1"], "accessToken": "access-token"}'
		const profile = new Profile()
		profile.managementLoggedIn = true
		civilServantProfileService.getProfile = sinon.stub().resolves(profile)

		deserializeCallback(data, (error: any, user: Identity) => {
			expect(error!).to.be.null
			expect(user!.uid).to.eql("abc123")
			expect(user!.username).to.eql("user@domain.com")
			expect(user!.roles[0]).to.eql("role1")
			expect(user!.accessToken).to.eql("access-token")
		})

	})

	it('should deserialize json to identity when user has not logged in already', () => {
		const deserializeCallback = auth.deserializeUser()
		const data: string = '{"uid": "abc123", "username": "user@domain.com", "roles": ["role1"], "accessToken": "access-token"}'

		const profile = new Profile()
		profile.managementLoggedIn = false
		civilServantProfileService.getProfile = sinon.stub().resolves(profile)
		const updateProfileCacheStub = sinon.stub().resolves()
		civilServantProfileService.updateProfileCache = updateProfileCacheStub

		deserializeCallback(data, (error: any, user: Identity) => {
			expect(error!).to.be.null
			expect(user!.uid).to.eql("abc123")
			expect(user!.username).to.eql("user@domain.com")
			expect(user!.roles[0]).to.eql("role1")
			expect(user!.accessToken).to.eql("access-token")
			expect(user!.managementLoggedIn).to.eql(true)
			expect(updateProfileCacheStub).to.have.been.calledOnceWith(profile)
		})

	})

	it('should add authentication and identity to response locals', function() {
		const addToResponseLocals: (request: Request, response: Response, next: NextFunction) => void = auth.addToResponseLocals()

		const response: Response = mockRes()
		const request: Request = <Request>{}
		const next: NextFunction = sinon.stub()
		request.isAuthenticated = sinon.stub().returns(true)
		request.user = new Identity('abc123', 'user@domain.com', ['role1'], 'access-token')

		const profile = new Profile()
		civilServantProfileService.getProfile = sinon.stub().resolves(profile)

		addToResponseLocals(request, response, next)

		expect(response.locals.isAuthenticated).to.eql(true)
		expect(response.locals.identity).to.eql(request.user)
		expect(next).to.have.been.calledOnce
	})
})
