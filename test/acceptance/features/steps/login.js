const {Given, When, Then, defineSupportCode} = require('cucumber');
const axios = require('axios');
const {expect, fail} = require('chai');

const http = axios.create({
    baseURL: 'http://localhost:3005',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
})

let promise;

Given(/^I am not authenticated$/, function () {
});

When(/^I request the home page$/, function () {
    promise = http.get('/');
});

Then(/^I am redirected to the login page$/, function (callback) {
    promise.then(function (response) {
        expect(response.status).to.eql(302);
    }).catch((error) => {
        callback(error);
    });
});