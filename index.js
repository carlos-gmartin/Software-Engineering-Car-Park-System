const express = require('express'); 
const app = express(); 
const fs = require('fs'); 
const config = require('./config');
const space = require('./classes/space.js');
const user = require('./classes/user.js');
const carPark = require('./classes/CarPark.js');
const admin = require('./classes/admin.js');
const pug = require('pug');
const crypto = require('crypto');
const { body,validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const { send } = require('process');
const Space = require('./classes/space.js');
const iv = crypto.randomBytes(16);
var urlencodedParser = bodyParser.urlencoded({extended:false});

/*
*
*
*	Code encryption and appending.
*
*/

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

/*
*
*	Login and register. Both admin and user.
*
*/

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

function testUserClass() {
	var testSpace = new Space(1,1,50,0,"false");
	var testUser = new user("username", "password", 50, "0010101001");
	var testSpace2 = testUser.bookSpace(testSpace, 50);
	console.log(testUser.currentLocation);
	console.log(testSpace.timing);
}

function testCarParkClass() {
	var testCarPark = new carPark("Name", 5, 5, 50);
	console.log(testCarPark.spaceArray);
}

app.use(express.static(config.public_folder));

app.use(express.urlencoded({ // encrypts data sent via POST
	extended: true
}));

// Send user page:
app.get('/user', function(req, res) {
	var fileSend = config.public_folder + '/user/home.pug';
	res.send(pug.renderFile(fileSend));
});

app.get('/user-account', function(req, res) {
	var fileSend = config.public_folder + '/user/account.pug';
	res.send(pug.renderFile(fileSend));
});

// Send admin page
app.get('/admin', function(req, res) {
	var fileSend = config.public_folder + '/admin/admin.pug';
	res.send(pug.renderFile(fileSend));
});

// Register and login
app.get('/Register', function(req, res) {
	var fileSend = config.public_folder + '/Register.pug';
	res.send(pug.renderFile(fileSend));
});

app.get('/Admin_Register', function(req, res) {
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

/*
*		
* 	Bookings and sorting.
*
*/

// Create server grid
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
// temporary grid size number. Need to create grid in admin.
var gridSize = [];

// Create initial grid.
app.post('/createGridButton', function(req, res){
	console.log("Created Parking lot successfully");
	var errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
	} else {
		console.log(req.body.rowSize);
		console.log(req.body.colSize);
		console.log(req.body.pricing);

		gridSize.push(req.body.rowSize);
		gridSize.push(req.body.colSize);
		console.log(gridSize);
		testAdmin = new admin('username', 'password', '01010219129129');
		var tempCarPark = testAdmin.addCarPark("CarPark1", req.body.rowSize, req.body.colSize, req.body.pricing);
		reqJSON = JSON.stringify(tempCarPark) + "\n";	
		appendToFile("CarParkDatabase.json", reqJSON);
		createGrid(req.body.rowSize, req.body.colSize);
		console.log("Created grid: " + req.body.rowSize + "," + req.body.colSize);
		res.send(gridSize);
	}
});

// Send grid size to user interface for generation.
app.get('/getGridSize', function(req,res){
	console.log("Sending grid size to grid.js");
	console.log(gridSize);
	res.send(JSON.stringify(gridSize));
});

app.get('/getCarParkDropdown', function(req, res) {
	const CarParkData = fs.readFileSync('CarParkDatabase.json', 'UTF-8');
	const lines = CarParkData.split(/\r?\n/);
	var CarParkArray = [];
	lines.forEach(function(line) {
		if(line.length > 2) {
			line = line.replace(/\r?\n|\r/g, "");
			console.log(line);
			var CarParkJSON = JSON.parse(line);
			CarParkArray.push(CarParkJSON.name);
		}
	});
	console.log(CarParkArray);
	res.send(JSON.stringify(CarParkArray));
});



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
	res.send(JSON.stringify(senderArray));
});

// Sort server grid.
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
		// console.log(JSONObject);
	});	
	return senderArray;
};


app.listen(config.port, function() { 
	testCarParkClass();
	console.log('Express app listening on port ', config.port); 
}); 
