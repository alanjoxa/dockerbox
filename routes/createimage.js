"use strict";

var express = require('express');
var router = express.Router();
var db = require('../services/db');
var docker = require('../docker');

/* GET home page. */
router.get('/createimage', function(req, res) {
  res.render('createimage', { title: ''});
});

router.post('/createimage', function(req, res) {
	docker.image.create(req.body.name, req.body.dockerfile);
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

module.exports = router;