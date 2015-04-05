"use strict";

var express = require('express');
var router = express.Router();
var db = require('../services/db');
var docker = require('../docker');
var dynamichaproxy = require("dynamichaproxy");
var async = require('async');

/* GET home page. */
router.get('/discover/qa/:qaname', function(req, res) {
	db.read('qa', function(err, body) {
		body.serverList = getServerList(body.app);
		res.render('discoverqa', body);
	}, req.params.qaname);

	function getServerList(app) {
		var ser = [];
		ser.push(app.image);
		doSome(app);

		function doSome(app) {
			if (!app.image) return;
			app.dependency && app.dependency.forEach(function(dep) {
				if (dep.image) ser.push(dep.image);
				doSome(dep);
			});
		};
		return ser;
	}
});

router.post('/discover/qa/delete/:qaname', function(req, res) {
	dynamichaproxy.remove(req.params.qaname, req.body.port, function(){});
	docker.compose.stop(req.params.qaname);
	db.delete('qa', function(err) {
		if (err) {
			res.json({
				status : 'error',
				err : err
			});
		} else {
			res.json({
				status : 'success',
				redirect : '/landing'
			});
		}
	}, req.params.qaname, req.body._rev);
});

router.get('/discover/image/:imagename', function(req, res) {
	async.parallel([getImageData, checkImageCreated], function(err, result){
		var body = result[0];
		body.processing = result[1];
		res.render('createimage', body);
	});

	function getImageData(cb) {
		db.read('image', cb, req.params.imagename);
	}
	function checkImageCreated(cb) {
		docker.image.listImages(function(list){
			cb(null, (list.indexOf(req.params.imagename) === -1));
		});
	}
	
});

router.post('/discover/image/:imagename', function(req, res) {
	docker.image.remove(req.params.imagename);
	docker.image.create(req.body.name, req.body.dockerfile);
	//The doc will get updated since it has the _rev in it
	db.create('image', req.body.name, req.body, function(err, body, header) {
		if (err) {
			res.json({
				status : 'error',
				err : err
			});
		} else {
			res.json({
				status : 'success',
				redirect : '/landing'
			});
		}
	});
});

router.post('/discover/image/delete/:imagename', function(req, res) {
	docker.image.remove(req.params.imagename);
	db.delete('image', function(err) {
		if (err) {
			res.json({
				status : 'error',
				err : err
			});
		} else {
			res.json({
				status : 'success',
				redirect : '/landing'
			});
		}
	}, req.params.imagename, req.body._rev);
});


module.exports = router;