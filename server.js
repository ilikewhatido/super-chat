var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var app = express();

var port = process.env.PORT || 3001;
var User = require('./models/User');

// Connect to DB
mongoose.connect("mongodb://localhost:27017/super-chat");

app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers',
			'X-Requested-With,content-type, Authorization');
	next();
});

// authenticate the given email/password pair
app.post('/auth', function(req, res) {
	User.findOne({
		email : req.body.email,
		password : req.body.password
	}, function(err, user) {
		if (err) {
			res.json({
				type : false,
				data : "Error occured: " + err
			});
		} else {
			if (user) {
				res.json({
					type : true,

					token : user.token
				});
			} else {
				res.json({
					type : false,
					data : "Incorrect email/password"
				});
			}
		}
	});
});

// create a new user
app.post('/create', function(req, res) {
	User.findOne({
		email : req.body.email,
		password : req.body.password
	}, function(err, user) {
		if (err) {
			res.json({
				type : false,
				data : "Error occured: " + err
			});
		} else {
			if (user) {
				res.json({
					type : false,
					data : "User already exists!"
				});
			} else {
				var userModel = new User();
				userModel.email = req.body.email;
				userModel.password = req.body.password;
				userModel.save(function(err, user) {
					user.token = jwt.sign(user, "super-chat-secret");
					user.save(function(err, user1) {
						res.json({
							type : true,
							data : user1,
							token : user1.token
						});
					});
				})
			}
		}
	});
});

// see user profile
app.get('/profile', ensureAuthorized, function(req, res) {
	User.findOne({
		token : req.token
	}, function(err, user) {
		if (err) {
			res.json({
				type : false,
				data : "Error occured: " + err
			});
		} else {
			res.json({
				type : true,
				data : user
			});
		}
	});
});

function ensureAuthorized(req, res, next) {
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        req.token = bearerHeader;
        next();
    } else {
        res.send(403);
    }
}

process.on('uncaughtException', function(err) {
	console.log(err);
});

//Start Server
app.listen(port, function() {
	console.log("Express server listening on port " + port);
});