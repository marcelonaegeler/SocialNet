var express = require('express');
var app = express();

app.configure(function(){
	app.use(express.static(__dirname + '/public'));	
	app.set('view engine', 'jade');
});

app.get('/', function(req, res){
	res.render('index', {layout: false});
});

app.get('/account/authenticated', function(req, res){
	if(req.session.loggedIn) {
		res.send(200);
	} else {
		res.send(401);
	}
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

app.listen(8080, function(){
	console.log('Server running at http://localhost:8080');
});
