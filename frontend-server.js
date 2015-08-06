var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();

var http = require('http').Server(app);
var port = process.env.PORT || 3001;
var io = require('socket.io')(http);

app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(bodyParser.json());
app.use(morgan("dev"));

process.on('uncaughtException', function(err) {
	console.log(err);
});

//************************************************************************
//Set .html as the default template extension
app.set('view engine', 'html');
//Initialize the ejs template engine
app.engine('html', require('ejs').renderFile);
//Tell express where it can find the templates
app.set('views', __dirname + '/views');
//Make the files in the public folder available to the world
app.use(express.static(__dirname + '/public'));
//************************************************************************

app.get('/login', function(req, res){
	// Render views/login.html
	res.render('login');
});

app.get('/chat', function(req, res){
	// Render views/chat.html
	res.render('chat');
});

io.on('connection', function(socket) {
	console.log('a user connected');
	
	socket.on('disconnect', function(){
	    console.log('user disconnected');
	});
	
	socket.on('user login', function(msg){
	    console.log('user login: ' + msg);
	});
	
	socket.on('user chat', function(data){
	    console.log('user chat: ' + data.message);
	});
});

http.listen(3001, function() {
	console.log('listening on *:3001');
});