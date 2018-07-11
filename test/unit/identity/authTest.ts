import {describe, it} from 'mocha'
import {mockRes} from 'sinon-express-mock'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {NextFunction, Request, Response} from 'express'
import * as sinon from 'sinon'
import {expect} from 'chai'
import {PassportStatic} from 'passport'
import {IdentityService} from '../../../src/identity/identityService'
import {Auth} from '../../../src/identity/auth'
import {Identity} from '../../../src/identity/identity'
import {Strategy} from "passport-oauth2";

chai.use(sinonChai)

describe('Auth tests', function() {
	let auth: Auth
	let passportStatic: PassportStatic = <PassportStatic>{}
	let identityService: IdentityService = <IdentityService>{}

	beforeEach(() => {
		auth = new Auth(
			'clientId',
			'secret',
			'localhost:8080',
			'http://localhost:3030',
			passportStatic,
			identityService
		)
	})

	it('should return next function if user is authenticated', function() {
		const authenticate: (
			request: Request,
			response: Response,
			next: NextFunction
		) => void = auth.checkAuthenticated()

		const reponse: Response = mockRes()
		const request: Request = <Request>{}
		request.isAuthenticated = sinon.stub().returns(true)

		const next: NextFunction = sinon.stub()

		authenticate(request, reponse, next)

		expect(next).to.have.been.calledOnce
	})

	it('should return redirect if user is not authenticated', function() {
		const originalUrl = 'original-url'

		const authenticate: (
			request: Request,
			response: Response,
			next: NextFunction
		) => void = auth.checkAuthenticated()

		const response: Response = mockRes()
		const request: Request = <Request>{}
		const next: NextFunction = sinon.stub()

		request.isAuthenticated = sinon.stub().returns(false)
		request.originalUrl = originalUrl

		response.cookie = sinon.stub()
		response.redirect = sinon.stub()

		authenticate(request, response, next)

		expect(response.cookie).to.have.been.calledOnceWith(
			'redirectTo',
			originalUrl
		)
		expect(response.redirect).to.have.been.calledOnceWith('/authenticate')
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
		const getDetails = sinon
			.stub()
			.withArgs(accessToken)
			.returns(identity)

		identityService.getDetails = getDetails
		const passportCallback = sinon.stub()

		verifyCallback(accessToken, 'refresh-token', null, passportCallback).then(
			function() {
				expect(passportCallback).to.have.been.calledOnceWith(null, identity)
			}
		)
	})

	it('verify should catch and log errors', function() {
		const verifyCallback = auth.verify()

		const accessToken = 'access-token'

		const error: Error = new Error('Test Error')

		const getDetails = sinon
			.stub()
			.withArgs(accessToken)
			.throws(error)

		identityService.getDetails = getDetails
		const passportCallback = sinon.stub()

		verifyCallback(accessToken, 'refresh-token', null, passportCallback).then(
			function() {
				expect(passportCallback).to.have.been.calledOnceWith(error)
			}
		)
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

	it('should call sendStatus(500) if redirectTo value is not present', function() {
		const redirect: (
			request: Request,
			response: Response
		) => void = auth.redirect()

		const reponse: Response = mockRes()
		const request: Request = <Request>{cookies: {}}

		redirect(request, reponse)

		expect(reponse.sendStatus).calledOnceWith(500)
	})

	it('should call redirect if redirectTo value is present in cookie', function() {
		const redirect: (
			request: Request,
			response: Response
		) => void = auth.redirect()

		const reponse: Response = mockRes()
		const request: Request = <Request>{cookies: {redirectTo: '/'}}

		redirect(request, reponse)

		expect(reponse.redirect).calledOnceWith('/')
		expect(request.cookies.redirectTo).to.be.undefined
	})


	it('should configure passport with serialize methods and strategy', () => {
		const deserializeUser = sinon.stub();
		const serializeUser = sinon.stub();
		const useStrategy = sinon.stub().withArgs(sinon.match.instanceOf(Strategy));

		passportStatic.deserializeUser = deserializeUser;
		passportStatic.serializeUser = serializeUser;
		passportStatic.use = useStrategy

		auth.configureStrategy()

		expect(passportStatic.deserializeUser).to.have.been.calledOnce;
		expect(passportStatic.serializeUser).to.have.been.calledOnce;
		expect(passportStatic.use).to.have.been.calledOnce;
	})


	it('should deserialize json to identity', () => {
		const deserializeCallback = auth.deserializeUser();
		const data: string = '{"uid": "abc123", "roles": ["role1"], "accessToken": "access-token"}';
		const identity: Identity = new Identity('abc123', ['role1'], 'access-token');

		const doneCallback = sinon.stub();

		deserializeCallback(data, doneCallback);

		expect(doneCallback).to.have.been.calledOnceWith(null, identity);
	})
})
