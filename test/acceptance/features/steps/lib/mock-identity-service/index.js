const mockServerClient = require('mockserver-client').mockServerClient;

function MockIdentityService(host, port) {
	this.mock = mockServerClient(host, port)

	this.stubAuthorizeEndpoint = function() {
		this.mock.mockAnyResponse({
			httpRequest: 	{
				method: 'GET',
				path: '/oauth/authorize',
				queryStringParameters : {
					response_type: [ 'code' ],
					redirect_uri: [ 'http://management.develop.learn.civilservice.gov.uk:3005/authenticate' ],
					client_id: [ 'a5881544-6159-4d2f-9b51-8c47ce97454d' ]
				},
			},
			httpResponse: {
				statusCode: 302,
				headers: [{
					name: 'Location',
					values : [ 'http://management.develop.learn.civilservice.gov.uk:3005/authenticate?code=secqBt' ]
				},
					{
						name: 'Host',
						values: ['identity.develop.learn.civilservice.gov.uk:8080']
					}],
			}
		}).then(
			function () {
				console.log("expectation created");
			},
			function (error) {
				console.log(error);
			}
		);
	}

	this.stubTokenEndpoint = function() {
		this.mock.mockAnyResponse({
			httpRequest: 	{
				method: 'POST',
				path: '/oauth/token',
				"body" : {
					"type" : "STRING",
					"string" : "grant_type=authorization_code&redirect_uri=http%3A%2F%2Fdevelop.learn.civilservice.gov.uk%3A3005%2Fauthenticate&client_id=89e1b5f4-01e6-470a-b2dc-78969140052a&client_secret=test&code=secqBt",
					"contentType" : "text/plain; charset=utf-8"
				}
			},
			httpResponse: {
				statusCode: 200,
				body: JSON.stringify({
					token_type: 'Bearer',
					access_token: 'rtOhkAPodsIQbSCAA0ophAnwlQhiap6QOnmzLzzOJm'
				}),
				headers: [{
					name: 'Host',
					values: ['identity.develop.learn.civilservice.gov.uk:8080']
				}],
			}
		}).then(
			function () {
				console.log("expectation created");
			},
			function (error) {
				console.log(error);
			}
		);
	}

	this.stubResolveEndpoint = function() {
		this.mock.mockAnyResponse({
			httpRequest: 	{
				method: 'GET',
				path: '/oauth/resolve',
				headers: {
					Authorization : [ "Bearer rtOhkAPodsIQbSCAA0ophAnwlQhiap6QOnmzLzzOJm" ]
				}
			},
			httpResponse: {
				statusCode: 200,
				body: JSON.stringify({
					uid: '8dc80f78-9a52-4c31-ac54-d280a70c18eb',
					roles: ['COURSE_MANAGER'],
					accessToken: 'rtOhkAPodsIQbSCAA0ophAnwlQhiap6QOnmzLzzOJm'
				}),
				headers: [{
					name: 'Host',
					values: ['identity.develop.learn.civilservice.gov.uk:8080']
				}],

			}
		}).then(
			function () {
				console.log("expectation created");
			},
			function (error) {
				console.log(error);
			}
		);
	}

	this.stubLoginJourney = function() {
		this.stubAuthorizeEndpoint()
		this.stubTokenEndpoint()
		this.stubResolveEndpoint()
	}

	this.reset = function() {
		this.mock.reset()
			.then(
				function () {
					console.log("reset all state for mock identity service");
				},
				function (error) {
					console.log(error);
				}
			);
	}
}

module.exports.MockIdentityService = MockIdentityService