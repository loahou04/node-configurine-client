var nock = require('nock'),
	_ = require('underscore'),
	assert = require('assert'),
	Client = require('../../lib/configurineClient.js'),
	clientOptions = {
		host: 'http://127.0.0.1:8080',
		clientId: 'fnord',
		sharedKey: 'a1c1f962-bc57-4109-8d49-bee9f562b321'
	},
	mockConfigObj = {
	    "id": "519bc51c9b9c05f772000001",
	    "name": "loglevel",
	    "value": "error",
	    "associations": {
	        "applications": [],
	        "environments": ["production"],
	    },
	    "isSensitive": false,
	    "isActive": true,
	    "owner": "myclient"
	},
	notFoundError = {
		code: 404,
		error: 'Not Found',
		message: 'Config entry not found'
	},
	getMockAccessToken = function() {
		return {"access_token":"myclient:1371666627113:" + new Date().getTime() + 500000 + ":47a8cdf5560706874688726cb1b3e843783c0811"};
	};

describe('getConfigByName', function() {
	
	it('should get config by name', function(done){

		client = new Client(clientOptions);
		var mockToken = nock('http://127.0.0.1:8080').post('/token').reply(200, getMockAccessToken());
		var mockConfig = nock('http://127.0.0.1:8080').get('/config?isActive=true&names=loglevel').reply(200, [mockConfigObj]);

		client.getConfigByName('loglevel', function(err, result) {
			assert(!err, 'should not return an error');
			assert(_.isArray(result), 'should return an array as result');
			assert(_.isEqual(result[0], mockConfigObj), 'result should match expected object');
			assert(mockToken.isDone(), 'should have satisfied mocked request');
			assert(mockConfig.isDone(), 'should have satisfied mocked request');
			done();
		});
	});

	it('should get config by name and associations', function(done){

		client = new Client(clientOptions);
		var mockToken = nock('http://127.0.0.1:8080').post('/token').reply(200, getMockAccessToken());
		var mockConfig = nock('http://127.0.0.1:8080').get('/config?isActive=true&names=loglevel&associations=application%7Cmyapp%7C1.0.0&associations=environment%7Cproduction').reply(200, [mockConfigObj]);
		var opts = {
			associations: {
				applications: [{
					name: 'myapp',
					version: '1.0.0'
				}],
				environments: ['production']
			}
		};

		client.getConfigByName('loglevel', opts, function(err, result) {
			assert(!err, 'should not return an error');
			assert(_.isArray(result), 'should return an array as result');
			assert(_.isEqual(result[0], mockConfigObj), 'result should match expected object');
			assert(mockToken.isDone(), 'should have satisfied mocked request');
			assert(mockConfig.isDone(), 'should have satisfied mocked request');
			done();
		});
	});

	it('should get config by name and use cached token', function(done){

		client = new Client(clientOptions);
		var mockToken = nock('http://127.0.0.1:8080').post('/token').reply(200, getMockAccessToken());
		var mockConfig = nock('http://127.0.0.1:8080').get('/config?isActive=true&names=loglevel').reply(200, [mockConfigObj]);

		client.getConfigByName('loglevel', function(err, result) {
			assert(!err, 'should not return an error');
			assert(_.isArray(result), 'should return an array as result');
			assert(_.isEqual(result[0], mockConfigObj), 'result should match expected object');
			assert(mockToken.isDone(), 'should have satisfied mocked request');
			assert(mockConfig.isDone(), 'should have satisfied mocked request');

			setTimeout(function() {
				mockConfig = nock('http://127.0.0.1:8080').get('/config?isActive=true&names=loglevel').reply(200, [mockConfigObj]);

				client.getConfigByName('loglevel', function(err, result) {
					assert(!err, 'should not return an error');
					assert(_.isArray(result), 'should return an array as result');
					assert(_.isEqual(result[0], mockConfigObj), 'result should match expected object');
					assert(mockConfig.isDone(), 'should have satisfied mocked request');
					done();
				});
			}, 200);
			
		});
	});

	it('should get return an error when configurine responds with a not found error', function(done){

		client = new Client(clientOptions);
		var mockToken = nock('http://127.0.0.1:8080').post('/token').reply(200, getMockAccessToken());
		var mockConfig = nock('http://127.0.0.1:8080').get('/config?isActive=true&names=loglevel').reply(404, notFoundError);

		client.getConfigByName('loglevel', function(err, result) {
			assert(err, 'should return an error');
			assert(!result, 'should not return a result');
			assert(mockToken.isDone(), 'should have satisfied mocked request');
			assert(mockConfig.isDone(), 'should have satisfied mocked request');
			done();
		});
	});

	it('should get return an error when configurine responds with an unexpected error', function(done){

		client = new Client(clientOptions);
		var mockToken = nock('http://127.0.0.1:8080').post('/token').reply(200, getMockAccessToken());
		var mockConfig = nock('http://127.0.0.1:8080').get('/config?isActive=true&names=loglevel').reply(500, 'Internal Sever Error');

		client.getConfigByName('loglevel', function(err, result) {
			assert(err, 'should return an error');
			assert(!result, 'should not return a result');
			assert(mockToken.isDone(), 'should have satisfied mocked request');
			assert(mockConfig.isDone(), 'should have satisfied mocked request');
			done();
		});
	});

	it('should get return an error the configurine responds with an error to the token call', function(done){

		client = new Client(clientOptions);
		var mockToken = nock('http://127.0.0.1:8080').post('/token').reply(404, notFoundError);

		client.getConfigByName('loglevel', function(err, result) {
			assert(err, 'should return an error');
			assert(!result, 'should not return a result');
			assert(mockToken.isDone(), 'should have satisfied mocked request');
			done();
		});
	});

	it('should get return an error the configurine responds with an unexpected error to the token call', function(done){

		client = new Client(clientOptions);
		var mockToken = nock('http://127.0.0.1:8080').post('/token').reply(404, 'Internal Server Error');

		client.getConfigByName('loglevel', function(err, result) {
			assert(err, 'should return an error');
			assert(!result, 'should not return a result');
			assert(mockToken.isDone(), 'should have satisfied mocked request');
			done();
		});
	});



});