const express = require('express'); 
const app = express(); 
const fs = require('fs'); 
const config = require('./config');
const space = require('./classes/space.js');
const pug = require('pug');
const crypto = require('crypto');
const { body,validationResult } = require('express-validator');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const { send } = require('process');
const iv = crypto.randomBytes(16);
var urlencodedParser = bodyParser.urlencoded({extended:false});

app.use(cookieParser());

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

async function adminLogin(req, res, fileSend) {
	var AdminUsers = await fs.readFileSync('adminDatabase.json', 'UTF-8');
	const AdminUsersLines = AdminUsers.split(/\r?\n/);
	var admin_login;
	await AdminUsersLines.forEach(async function(AdminLine) {
		AdminLine = AdminLine.replace(/\r?\n|\r/g, "");
		if (AdminLine.length > 2) {
			//console.log("AdminLine = " +AdminLine);
			var JSONAdminline = JSON.parse(AdminLine);
			//console.log("JSONAdminline = " + JSONAdminline);
			var adminUser = decrypt(JSONAdminline);
			adminUser = JSON.parse(adminUser);
			//console.log(adminUser);
			//console.log("adminUser.username = " + adminUser.username)
			//console.log("adminUser.password = " + adminUser.password)
			if(req.body.username === adminUser.username) {
				//console.log("Admin Username Correct!");
				if(req.body.password === adminUser.password) {
					//console.log("Admin Password Correct!");
					//console.log("Admin Login Successful!");
					//console.log("admin_login = " + admin_login);
					if (admin_login != "true") {
						admin_login = "true";
						//console.log("admin_login = " + admin_login);
						var fileSend = config.public_folder + "/admin/admin.pug";
						res.send(pug.renderFile(fileSend));
					}
				}
			}
		}
		
	});
	return admin_login;
}

async function userLogin(req, res, fileSend) {
	const userData = fs.readFileSync('database.json', 'UTF-8');
	const lines = userData.split(/\r?\n/);
	var result;
	await lines.forEach(async function(line) {
		line = line.replace(/\r?\n|\r/g, "");
		if (line.length > 2)
			{
				//console.log(line);
				var JSONline = JSON.parse(line);
				//console.log(JSONline);
				var user = decrypt(JSONline);
				//console.log(user);
				var JSONuser = JSON.parse(user);
				var bannedUsers = fs.readFileSync('adminBlacklist.json', 'UTF-8');
				const bannedUserslines = bannedUsers.split(/\r?\n/);
				var banned_user;
				await bannedUserslines.forEach((bannedLine) => {
					if(req.body.username === bannedLine) {
						//console.log("Found banned user!")
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
						//console.log("Username Correct!");
						if (req.body.password === JSONuser.password) {
							//console.log("Password Correct!");
							var userCookie = {
								username: req.body.username,
								admin: "false"
							};
							res.cookie("userData", userCookie, { httpOnly: true, secure: false });
							var fileSend = config.public_folder + "/user/home.pug";
							//res.send(pug.renderFile(fileSend));
							res.redirect(301, '/user');
							result = "true";
						}
					}
				}
			}
		});	
		return result;
	}
	
	

async function login(req, res) {
	fileSend = "./Login.pug";
	//console.log(JSON.stringify(req.body));
	var admin_login = await adminLogin(req, res, fileSend);
	if(adminLogin != true) {
		var user_login = await userLogin(req, res, fileSend);
	}
	//console.log(admin_login)
	//console.log(user_login)
	if((admin_login != "true") && (user_login != "true")) {
		await loginUnsuccessful(req, res, user_login, admin_login);
	}
}	

function loginUnsuccessful(req, res, result, admin_login) {
	var fileSend = config.public_folder + "/login.pug";
	if(result != "true" && admin_login != "true") {
		console.log("Login unsuccessful!");
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
	//console.log(req.cookies.userData.username);
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

app.get('/Admin_Register', function(req, res) {
	console.log("Requested /Admin_Register site");
	var fileSend = config.public_folder + '/admin/AdminRegister.pug';
	res.send(pug.renderFile(fileSend));
});

app.get('/Login', function(req, res) {
	console.log(res.cookies);
	if(res.cookies != null) {
		if(res.cookies.admin == "true") {
			var fileSend = config.public_folder + "/admin/admin.pug";
			res.send(pug.renderFile(fileSend));
		} else {
			res.redirect(301, '/user');
		}
	} else {
		console.log("Requested /Login site");
		var fileSend = config.public_folder + '/Login.pug';
		res.send(pug.renderFile(fileSend));
	}
});


//  Send and Receive Bookings
// create as async function for responses?
/*
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
	*/

app.get('/getBookings', urlencodedParser, function(req, res) {
	const spaceData = fs.readFileSync('spaceDatabase.json', 'UTF-8');
	const lines = spaceData.split(/\r?\n/);
	const senderArray = [];
	counter = 0;
	var sortedDatabase = sortSpaceDatabase();
	sortedDatabase.forEach((line) => {
		if(line.reserved == "true") {
			senderArray.push(1);
		} else if (line.reserved == "false") {
			senderArray.push(2);
		} else {
			senderArray.push(3);
		}
	});
	console.log(senderArray);
	res.send(JSON.stringify(senderArray));
});

function sortSpaceDatabase() {
	const spaceData = fs.readFileSync('spaceDatabase.json', 'UTF-8');
	const lines = spaceData.split(/\r?\n/);
	const senderArray = [];
	counter = 0;
	lines.forEach((line) => {
		line = line.replace(/\r?\n|\r/g, "");
		if (line.length > 2) // Change number if no work
		{
			var JSONline = JSON.parse(line);
			//console.log(JSONline);
			senderArray.push(JSONline);
			//senderArray.forEach((JSONObject) => {
			//	console.log(JSONObject);
			//});	
		}
	});
	//senderArray.forEach((JSONObject) => {
	//	console.log(JSONObject);
	//});	
	senderArray.sort((a, b) => {
		if(a.positionY > b.positionY) {
			return 1;
		} else if (a.positionY == b.positionY){
			if(a.positionX > b.positionX) {
				return 1;
			} else {
				return -1;
			}
		} else {
			return -1;
		}
	});
	senderArray.forEach((JSONObject) => {
		console.log(JSONObject);
	});	
	return senderArray;
};
	

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


app.post('/Admin_Register', [
	body('username', 'Includes Code').trim().escape(),
	body('password', 'Includes Code').trim().escape()
	], function(req, res) {
		console.log('POSTED Admin_Register');
		var errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
		} else {
			console.log(JSON.stringify(req.body));
			var encryptedData = encrypt(JSON.stringify(req.body));
			console.log(encryptedData);
			reqJSON = JSON.stringify(encryptedData) + "\n";	
			fs.appendFile('adminDatabase.json', reqJSON, function(err) {
				if (err) {
					console.log("Error Writing to File!");
				} else {
					console.log("Success Writing to File!");
				}
			});
			var decryptedData = decrypt(encryptedData);
			console.log(decryptedData);
			res.send(pug.renderFile(config.public_folder + '/Register.pug', {
				server_response: 'Admin Registration Successful!'
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
	console.log('Express app listening on port ', config.port); 
}); 
