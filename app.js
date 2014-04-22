var express = require('express')
	, app = express()
	, nodemailer = require('nodemailer')
	, MemoryState = require('connect').session.MemoryState;

// Import the data layer
var mogoose = require('mongoose');
var config = {
	mail: require('./config/mail')
}

// Import the accounts
var Account = require('./models/Account')(config, mongoose, nodemailer);

app.configure(function(){
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));	
	app.use(express.limit('1mb'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "SocialNet secret key", store: new MemoryState() }));
	mongoose.connect('mogodb://localhost/nodebackbone');
});

app.get('/', function(req, res){
	res.render('index.jade', {layout: false});
});

app.post('/login', function(req, res) {
	console.log('login request');
	var email = req.param('email', null)
		, password = req.param('password', null);

	if(null == email || email.length < 1 || null == password || password.length < 1) {
		res.send(400);
		return;
	}

	Account.login(email, password, function(success) {
		if(!success) {
			res.send(401);
			return;
		}
		console.log('login was successfull');
		res.send(200);
	});

});

app.post('/register', function(req, res) {
	var firstName = req.param('firstName', '');
	var lastName = req.param('lastName', '');
	var email = req.param('email', null);
	var password = req.param('password', null);

	if(null == email || null == password) {
		res.send(400);
		return;
	}

	Account.register(email, password, firstName, lastName);
	res.send(200);
});

app.get('/account/authenticated', function(req, res){
	if(req.session.loggedIn) {
		res.send(200);
	} else {
		res.send(401);
	}
});

app.post('/forgotpassword', function(req, res) {
	var hostname = req.headers.host
		, resetPasswordUrl = 'http://' + hostname + '/resetPassword'
		, email = req.param('email', null);

	if(null == email || email.length < 1) {
		res.send(400);
		return;
	}

	Account.forgotPassword(email, resetPassword, function(success) {
		if(success) {
			res.send(200);
		} else {
			// User name or password not found
			res.send(404);
		}
	});
});

app.get('/resetPassword', function(req, res) {
	var accountId = req.param('account', null);
	res.render('resetPassword.jade', { locals:{ accountId: accountId } });
});

app.post('resetPassword', function(req, res) {
	var accountId = req.param('accountId', null)
		, password = req.param('password', null);
	if(null != accountId && null != password) {
		Account.changePassword(accountId, password);
	}
	res.render('resetPasswordSuccess.jade');
});

app.get('/accounts/:id', function(req, res) {
	var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;

	Account.findOne({ _id:accountId }, function(account) {
		res.send(account);
	});
});

app.listen(8080, function(){
	console.log('Server running at http://localhost:8080');
});