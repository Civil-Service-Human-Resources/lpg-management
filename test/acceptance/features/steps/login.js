const {Given, When, Then} = require('cucumber');
const axios = require('axios');
const {expect} = require('chai');
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support');
const tough = require('tough-cookie');

const {MockIdentityService} = require('./lib/mock-identity-service')
const {MockLearningCatalogue} = require('./lib/mock-learning-catalogue')

axiosCookieJarSupport.default(axios);

const cookieJar = new tough.CookieJar();

const http = axios.create({
    baseURL: 'http://management.develop.learn.civilservice.gov.uk:3005',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 6000000,
})

let promise;
let identityService;
let learningCatalogue;

Given(/^I am not authenticated$/, () => {
});

When(/^I request the home page$/, () => {
	learningCatalogue = new MockLearningCatalogue('localhost', 9001)
	learningCatalogue.stubCoursesEndpoint()

	promise = http.get('/', {
		jar: cookieJar,
		withCredentials: true
	})
});

Then(/^I am redirected to the login page$/, (callback) => {
    promise.then(function (response) {
        expect(response.status).to.eql(302);
    }).catch((error) => {
        callback(error);
    });
});

Given(/^I am an authenticated user$/, () => {
	identityService = new MockIdentityService('identity.develop.learn.civilservice.gov.uk', 8080)
	identityService.stubLoginJourney()
})

Then(/^I see a paginated list of all courses$/, (callback) => {
	promise.then(function (response) {
		expect(response.status).to.eql(200);
	}).catch((error) => {
		callback(error);
	}).finally((callback) => {
		identityService.reset()
		learningCatalogue.reset()
	})
});