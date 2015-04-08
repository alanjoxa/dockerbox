"use strict";

var express = require('express');
var router = express.Router();
var secrets = require(__dirname + '/../secrets.json');
var google = require('googleapis');


var options = { fileId: '123' };


var oauth2Client =
  new google.auth.OAuth2(
    secrets.web.client_id,
    secrets.web.client_secret,
    secrets.web.redirect_uris[0]);

/* GET login page. */
router.get('/', function(req, res) {
  var tokens = req.session.tokens;
  var title = '';
  if (tokens) {
    title = 'Access token --> ' + tokens.access_token;
  }
  else {
    title = 'Not logged in.';
  }
  res.render('login', { title: 'Google NodeJS API Client Tester: ' + title });
});

router.post('/login', function(req, res) {
  var options = {
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  };
  var generatedUrl = oauth2Client.generateAuthUrl(options);
  res.redirect(generatedUrl);
});

router.get('/oauth2callback', function(req, res) {
  var code = req.query.code;
  if(code) {
    req.session.code = code;
    oauth2Client.getToken(code, function(err, tokens) {
      if(err) {
        console.log(err);
      }

      req.session.tokens = tokens;
      oauth2Client.setCredentials(tokens);
      res.redirect(req.session.custom_target || '/landing');
    });
  }
  else {
    res.redirect('/');
  }
});

/*
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      if(appAuthenticate(req))
        if(req.session.custom_target)
          res.redirect(req.session.custom_target);
        else
          res.redirect('/list');
      else {
        logout(req, true);
        res.redirect('/unauthorized');
      }
    });

router.get('/*', ensureAuthenticated);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.custom_target = req.url;
  res.redirect('/login');
}
*/

module.exports = router;
