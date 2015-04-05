"use strict";

var express = require('express');
var router = express.Router();
var db = require('../services/db');
var docker = require('../docker');
var dynamichaproxy = require("dynamichaproxy");

/* GET home page. */
router.get('/createqa', function(req, res) {
	db.read('image', function(err, images){
		if(err) { res.send(err); return;}
		var imageMap = {};
		images.rows.map(function(i){return i.value;}).forEach(function(i){
			imageMap[i.name] = i.port;
		});
		res.render('createqa', {
			title: '',
			images: imageMap
		});
	});
});

router.post('/createqa', function(req, res) {
	dynamichaproxy.add(req.body.name, function(portConfig){
		req.body.port = portConfig.port;
		docker.compose.start(req.body.name, req.body.app, portConfig);
		db.create('qa', req.body.name, req.body, function(err, body, header) {
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
});


module.exports = router;