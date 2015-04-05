var exec = require('child_process').exec,
	fs = require('fs'),
	tempFolder = __dirname + '/tempfiles/composefolders/';
var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var docker1 = new Docker();

module.exports = {
	start: function(name, serverStructure, portConfig) {
		//create a folder for the compose yml file
		exec('mkdir -p '+ tempFolder + name, function(err, stdout, stderr) {
			if(err||stdout||stderr) console.log(err, stdout, stderr);
			if(err) return;

			var ymlString = CreateYml(serverStructure, portConfig.httpPort);
		    fs.writeFileSync(tempFolder + name + '/docker-compose.yml', ymlString);
			
			exec('COMPOSE_FILE=' + tempFolder + name + '/docker-compose.yml' + ' docker-compose up -d', function(err, stdout, stderr) {
	    		if(err||stdout||stderr) console.log(err, stdout, stderr);
	    		if(err) return;
	    		console.log(stdout, stderr);
	    	});
		});
	},
	stop: function(name) {
		exec('COMPOSE_FILE=' + tempFolder + name + '/docker-compose.yml' + ' docker-compose stop ' , function(err, stdout, stderr) {
			if(err) {
				console.log(err);
				return;
			}
			exec('COMPOSE_FILE=' + tempFolder + name + '/docker-compose.yml' + ' docker-compose rm --force' , function(err, stdout, stderr) {
				if(err) {
					console.log(err);
				}
			});
		});
	},
	remove: function(name) {
		exec('COMPOSE_FILE=' + tempFolder + name + '/docker-compose.yml' + ' docker-compose rm --force' , function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			}
		});
	}
}


function CreateYml(appStruct, http_port) {
	var yml = appTemplate(appStruct, http_port);
	appStruct.dependency.forEach(function(d){
		yml += appTemplate(d)
	});
	return yml;

	function appTemplate(app, http_port) {
		app.dependency = app.dependency || [];
		var template = app.name + ':\n' +
		'  image: ' + app.image + '\n' +
		( http_port ? '  ports:\n' : '') +
		( http_port ? '   - \"' + http_port + ':' + app.port + '\"\n' : '') +
		( app.dependency.length ? '  links:\n' : '');

		app.dependency.forEach(function(d){
			template += '   - ' + d.name + ':' + d.fqdn + '\n';
		});

		return template;
	}
}