import {AuthConfig} from '../../../src/identity/authConfig'
import {expect} from 'chai'

describe('AuthConfig tests', () => {
	const clientId: string = 'client-_id'
	const clientSecret: string = 'client-secret'
	const authenticationServiceUrl: string = 'authentication-service-url'
	const callbackUrl: string = 'callback-url'
	const authenticationPath: string = 'authentication-path'

	it('should set config properties in constructor', () => {
		const config: AuthConfig = new AuthConfig(
			clientId,
			clientSecret,
			authenticationServiceUrl,
			callbackUrl,
			authenticationPath
		)

		expect(config.clientId).to.equal(clientId)
		expect(config.clientSecret).to.equal(clientSecret)
		expect(config.authenticationServiceUrl).to.equal(authenticationServiceUrl)
		expect(config.callbackUrl).to.equal(callbackUrl)
		expect(config.authenticationPath).to.equal(authenticationPath)
	})

	it('should override config properties in setters', () => {
		const config: AuthConfig = new AuthConfig('', '', '', '', '')

		config.clientId = clientId
		expect(config.clientId).to.equal(clientId)

		config.clientSecret = clientSecret
		expect(config.clientSecret).to.equal(clientSecret)

		config.authenticationServiceUrl = authenticationServiceUrl
		expect(config.authenticationServiceUrl).to.equal(authenticationServiceUrl)

		config.callbackUrl = callbackUrl
		expect(config.callbackUrl).to.equal(callbackUrl)

		config.authenticationPath = authenticationPath
		expect(config.authenticationPath).to.equal(authenticationPath)
	})
})
