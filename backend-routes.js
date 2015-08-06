var User = require('./models/User');
var Message = require('./models/Message');
var jwt = require("jsonwebtoken");

module.exports = function(app) {
	
	// authenticate the given name/password pair
	app.post('/auth', function(req, res) {
		User.findOne({
			name : req.body.name,
			password : req.body.password
		}, function(err, user) {
			if (err) {
				res.json({
					type : false,
					token : null
				});
			} else {
				if (user) {
					console.log(user.token);
					res.json({
						type : true,
						token : user.token
					});
				} else {
					res.json({
						type : false,
						token : null
					});
				}
			}
		});
	});

	// Create a new user
	app.post('/user', function(req, res) {
		User.findOne({
			name : req.body.name,
			password : req.body.password
		}, function(err, user) {
			// Error
			if (err) {
				res.json({
					type : false,
					data : "Error occured: " + err
				});
			} else {
				// User already exists
				if (user) {
					res.json({
						type : false,
						data : "User already exists!"
					});
				// Create a new user
				} else {
					var userModel = new User();
					userModel.name = req.body.name;
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
	app.get('/user', ensureAuthorized, function(req, res) {
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
	
	// post a message
	app.post('/message', ensureAuthorized, function(req, res) {
		User.findOne({
			token : req.token
		}, function(err, user) {
			if (err) {
				res.json({
					type : false,
					data : "Error occured: " + err
				});
			} else {
				// save message
				var messageModel = new Message();
				messageModel.message = req.body.message;
				messageModel.user_name = user.name;
				messageModel.save(function(err, message) {
					res.json({
						type : true,
						data : message
					});
				});
			}
		});
	});
	
	app.get('/message', ensureAuthorized, function(req, res) {
		User.findOne({
			token : req.token
		}, function(err, user) {
			if (err) {
				res.json({
					type : false,
					data : "Error occured: " + err
				});
			} else {
				if (user) {
					// find all messages
					Message.find({}, function(err, messages) {
						res.json({
							type : true,
							data : messages
						});
					});
				} else {
					res.json({
						type : false,
						data : null
					});
				}
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

};