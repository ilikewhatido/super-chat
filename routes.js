var User = require('./models/User');

module.exports = function(app) {
	
	app.get('/login', function(req, res){
		// Render views/login.html
		res.render('login');
	});

	// authenticate the given name/password pair
	app.post('/auth', function(req, res) {
		
		console.log(req.body.name);
		console.log(req.body.password);
		
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

	// create a new user
	app.post('/user', function(req, res) {
		User.findOne({
			name : req.body.name,
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