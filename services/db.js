var nano = require('nano')('http://192.168.59.103:5984');
var db = {
	qa: nano.db.use('orchestrator-qa'),
	image: nano.db.use('orchestrator-app')
};

module.exports = {
	create: function(dbname, name, data, cb) {
		db[dbname].insert(data, name, function(err, body, header) {
			if (err) {
				console.log('[db.insert] ', err.message);
			}
			cb(err, body, header);
		});
	},
	read: function(dbname, cb, name) {
		//name is optonal, if name get the details of that QA or else get the details of all QA
		if (name) {
			db[dbname].get(name, {
				revs_info: true
			}, function(err, body) {
				cb(err, body);
			});
		} else {
			db[dbname].view('minlist', 'minlist', function(err, body) {
				cb(err, body);
			});
		}
	},

	update: function() {

	},

	delete: function(dbname, cb, name, rev) {
		db[dbname].destroy(name, rev, function(err, body) {
			cb(err, body);
		});
	}

}