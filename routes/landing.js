"use strict";

var express = require('express');
var router = express.Router();
var db = require('../services/db');
var async = require('async');

/* GET home page. */
router.get('/landing', function(req, res) {
	async.parallel([getQAlist, getApplist], function(err, result){
		if(err) res.send(err);
		else res.render('landing', {qa : result[0], app : result[1]});
	});

	function getQAlist(cb){
		db.read('qa', cb);
	}
	function getApplist(cb){
		db.read('image', cb);
	}
	
});

module.exports = router;