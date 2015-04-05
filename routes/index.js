"use strict";

module.exports = function (app) {
	app.use('/', require('./gauth'));
	app.use('/', require('./landing'));
	app.use('/', require('./discover'));
	app.use('/', require('./createqa'));
	app.use('/', require('./createimage'));
};