
var exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	fs = require('fs'),
	tempFolder = __dirname + '/tempfiles/dockerfiles/';

module.exports = {
	create : function(name, dockerfileString) {
		//create a folder for the dockerfile
		exec('mkdir -p '+ tempFolder + name, function(err, stdout, stderr) {
			if(err||stdout||stderr) console.log(err, stdout, stderr);
			if(err) return;
	    
	    	fs.writeFileSync(tempFolder + name + '/Dockerfile', dockerfileString);
	    	var build = spawn('docker', ['build', '-t', name , tempFolder + name]);	

			build.stdout.on('data', function(data) { 
				console.log(data ? data.toString('utf8') : ''); 
			});
			build.stdout.on('end', function(data) {
				console.log(data ? data.toString('utf8') : '');
			});
			build.on('exit', function(code) {
				console.log('Exit with CODE: ' + code);
			});
		});
	},
	
	remove : function(name) {
		exec('docker rmi ' + name, function(err, stdout, stderr) {
			if(err||stdout||stderr) console.log(err, stdout, stderr);
			if(err) return;
		});
	},

	listImages : function(cb) {
		var command = "docker images | awk '{print $1}'";
		exec(command, function(err, stdout, stderr){
			if(err) {
				console.log(err);
			}
			var taglist = stdout.split(/\n/).filter(function(a){return !!a && a != 'latest' && a != 'TAG'});
			cb(taglist);
		});
	}
}
