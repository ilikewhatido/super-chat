var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var app = express();

var port = process.env.PORT || 3001;

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
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

require('./routes.js')(app)

process.on('uncaughtException', function(err) {
	console.log(err);
});

//************************************************************************
//Set .html as the default template extension
app.set('view engine', 'html');
// Initialize the ejs template engine
app.engine('html', require('ejs').renderFile);
//Tell express where it can find the templates
app.set('views', __dirname + '/views');
// Make the files in the public folder available to the world
app.use(express.static(__dirname + '/public'));
//************************************************************************

//Start Server
app.listen(port, function() {
	console.log("Express server listening on port " + port);
});