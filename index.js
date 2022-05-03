const express = require('express'); 
const app = express(); 
const fs = require('fs'); 
const config = require('./config');
const space = require('./classes/space.js');
const pug = require('pug');
const crypto = require('crypto');
const { body,validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const iv = crypto.randomBytes(16);
var urlencodedParser = bodyParser.urlencoded({extended:false});

function encrypt(text) {

    const cipher = crypto.createCipheriv('aes-256-cbc', config.key, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

function decrypt(json) {
	const decipher = crypto.createDecipheriv('aes-256-cbc', config.key, Buffer.from(json.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(json.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
}

function appendToFile(fileName, reqJSON)
{
	fs.appendFile(fileName, reqJSON, function(err) {
		if (err) {
			console.log("Error Writing to File!");
		} else {
			//console.log("Success Writing to File!");
		}
	});
}

function createGrid(sizeX, sizeY){
	// X value
    for (let indexX = 0; indexX < sizeX; indexX++) {
		// Y value
		for (let indexY = 0; indexY < sizeY; indexY++) {
			var newSpace = new space(indexX, indexY, 10, 10, "false");
			JSONnewSpace = JSON.stringify(newSpace);
			JSONnewSpace = JSONnewSpace + '\n';
			appendToFile('spaceDatabase.json', JSONnewSpace);
		}
	}
}

async function login(req, res) {
	var fileSend = config.public_folder + "/login.pug";
	console.log(JSON.stringify(req.body));
	const userData = fs.readFileSync('database.json', 'UTF-8');
	const lines = userData.split(/\r?\n/);
	var result;
	await lines.forEach(async function(line) {
		line = line.replace(/\r?\n|\r/g, "");
		if (line.length > 2)
			{
				console.log(line);
				var JSONline = JSON.parse(line);
				console.log(JSONline);
				var user = decrypt(JSONline);
				console.log(user);
				var JSONuser = JSON.parse(user);
				var bannedUsers = fs.readFileSync('adminBlacklist.json', 'UTF-8');
				const bannedUserslines = bannedUsers.split(/\r?\n/);
				var banned_user;
				await bannedUserslines.forEach((bannedLine) => {
					if(req.body.username === bannedLine) {
						if(banned_user != "true") {
							res.send(pug.renderFile(fileSend, {
								server_response: 'Banned User'
							}));
							banned_user = "true";
							result = "true";
						}
					}
				});
				if(banned_user != "true") {
					if(req.body.username === JSONuser.username)
					{
						console.log("Username Correct!");
						if (req.body.password === JSONuser.password) {
							console.log("Password Correct!");
							res.send(pug.renderFile(fileSend, {
								server_response: 'Login Successful!'
							}));
							result = "true";
						}
					}
				}
			}
		});
	if(result != "true") {
		res.send(pug.renderFile(fileSend, {
			server_response: 'Login Unsuccessful!'
		}));
	}
}

function banUser(username) {
	username = username + "\n";
	appendToFile('adminBlacklist.json', username);
}

app.use(express.static(config.public_folder));

app.use(express.urlencoded({ // encrypts data sent via POST
	extended: true
}));

// Send user page:
app.get('/user', function(req, res) {
	console.log("user");
	var fileSend = config.public_folder + '/user/home.pug';
	res.send(pug.renderFile(fileSend));
});

app.get('/user-account', function(req, res) {
	console.log("user");
	var fileSend = config.public_folder + '/user/account.pug';
	res.send(pug.renderFile(fileSend));
});

// Send admin page
app.get('/admin', function(req, res) {
	console.log("user");
	var fileSend = config.public_folder + '/admin/admin.pug';
	res.send(pug.renderFile(fileSend));
});

// Register and login
app.get('/Register', function(req, res) {
	console.log("Requested /Register site");
	var fileSend = config.public_folder + '/Register.pug';
	res.send(pug.renderFile(fileSend));
});

app.get('/Login', function(req, res) {
	console.log("Requested /Login site");
	var fileSend = config.public_folder + '/Login.pug';
	res.send(pug.renderFile(fileSend));
});


//  Send and Receive Bookings
app.post('/getBookings', urlencodedParser, function(req, res) {
	var client_response = {
		x: req.body.x,
		y: req.body.y
	}
	const spaceData = fs.readFileSync('spaceDatabase.json', 'UTF-8');
	const lines = spaceData.split(/\r?\n/);
	lines.forEach((line) => {
		line = line.replace(/\r?\n|\r/g, "");
		if (line.length > 2) // Change number if no work
		{
			//console.log(line);
			var JSONline = JSON.parse(line);
			//console.log(JSONline);
			//console.log(spaceData);
			//console.log(req.body.x)
			//console.log(JSONline.positionX)
			// console.log('local: ' + req.body.x + "   " + 'server: ' + JSONline.positionX);
			// console.log(req.body.x + ' === ' + JSONline.positionX);
			// console.log(req.body.x === JSONline.positionX);
			if(req.body.x == JSONline.positionX)
			{
				//console.log("X Value Correct");
				if (req.body.y == JSONline.positionY) {
					//console.log("Y Value Correct");
					if(JSONline.reserved === "false"){
						res.send({
							colour: "grey"
						});
					}
					else if(JSONline.reserved === "true"){
						console.log("Found true");
						res.send({
							colour: "green"
						});
					}
					else if(JSONline.reserved === "event"){
						console.log("Found white");
						res.send({
							colour: "blue"
						});
					}
				}
			}
		}
	})});

app.post('/register', [
		body('username', 'Includes Code').trim().escape(),
		body('password', 'Includes Code').trim().escape()
	], function(req, res) {
		console.log('POSTED Register');
		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
		} else {
			console.log(JSON.stringify(req.body));
			var encryptedData = encrypt(JSON.stringify(req.body));
			console.log(encryptedData);
			reqJSON = JSON.stringify(encryptedData) + "\n";	
			appendToFile('database.json', reqJSON);
			var decryptedData = decrypt(encryptedData);
			console.log(decryptedData);
			res.send(pug.renderFile(config.public_folder + '/Register.pug', {
				server_response: 'Registration Successful!'
			}));
		}
	});


app.post('/login', [
		//body('username', 'Includes Code').trim().escape(),
		//body('password', 'Includes Code').trim().escape()
	], function(req, res) {
		console.log('POSTED Login');
		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
		} else {
			login(req, res);
			//var decryptedData = decrypt(encryptedData);
			//console.log(decryptedData);
			//res.send(pug.renderFile(config.public_folder + '/login.pug', {
			//	server_response: 'Registration Successful!'
			//}));
		}
	});


app.listen(config.port, function() { 
	banUser("vgb20dsu");
	console.log('Express app listening on port ', config.port); 
}); 
