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
const session = require('express-session');
const req = require('express/lib/request');
const iv = crypto.randomBytes(16);
var urlencodedParser = bodyParser.urlencoded({extended:false});
const editJsonFile = require("edit-json-file");

// Session settings

app.use(session({
	secret: config.key,
	resave: false,
	saveUninitialized: false
}));


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
			// console.log("Success Writing to File!");
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
						sess=req.session;
						sess.userid = req.body.username;
						sess.admin = "true";
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
							sess=req.session;
							sess.userid = req.body.username;
							sess.admin = "false";
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
	sess = req.session;
	console.log("Sess.userid = " + sess.userid);
	console.log("Sess.admin = " + sess.admin);
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

// Default send to login page
app.get('/', function(req, res) {
	res.redirect('/login', 301);
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

// Add current users balance
app.get('/getBalance', function(req, res){

	sess = req.session;
	var balance;

	const userData = fs.readFileSync('database.json', 'UTF-8');
	const lines = userData.split(/\r?\n/);
	var result;
	lines.forEach(function(line) {
		line = line.replace(/\r?\n|\r/g, "");
		if (line.length > 2)
			{
				//console.log(line);
				var JSONline = JSON.parse(line);
				//console.log(JSONline);
				var user = decrypt(JSONline);
				//console.log(user);
				var JSONuser = JSON.parse(user);
				if(JSONuser.username == sess.userid){
					balance = JSONuser.balance;
				}
			}
	});
	res.send(balance);
});


/*
*		
* 	Bookings and sorting.
*
*/

/*
*	Grid and car parks.
*
*/

// Create server grid
function createGrid(sizeX, sizeY, price){
	// X value
    for (let indexX = 0; indexX < sizeX; indexX++) {
		// Y value
		for (let indexY = 0; indexY < sizeY; indexY++) {
			var newSpace = new space(indexX, indexY, price, "false");
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
		gridSize.push(req.body.rowSize);
		gridSize.push(req.body.colSize);
		testAdmin = new admin('username', 'password', '01010219129129');
		var tempCarPark = testAdmin.addCarPark(req.body.CarParkName, req.body.rowSize, req.body.colSize, req.body.pricing);
		reqJSON = JSON.stringify(tempCarPark) + "\n";	
		appendToFile("CarParkDatabase.json", reqJSON);
		createGrid(req.body.rowSize, req.body.colSize, req.body.pricing);
		res.send(gridSize);
	}
});

// Send grid size to user interface for generation.
app.post('/getGridSize', urlencodedParser, function(req,res){
	var gridSize = [];
	console.log("Grid Size req.body.name: " + req.body.name);
	var CarParkDatabase = fs.readFileSync('CarParkDatabase.json', 'UTF-8');
	const CarParkDatabaseLines = CarParkDatabase.split(/\r?\n/);
	var found;
	var rows;
	var cols;
	CarParkDatabaseLines.forEach(async function(DatabaseLine) {
		DatabaseLine = DatabaseLine.replace(/\r?\n|\r/g, "");
		if (DatabaseLine.length > 2) {
			//console.log("AdminLine = " +AdminLine);
			var JSONDatabaseLine = JSON.parse(DatabaseLine);
			//console.log("JSONAdminline = " + JSONAdminline);
			//console.log(adminUser);
			//console.log("adminUser.username = " + adminUser.username)
			//console.log("adminUser.password = " + adminUser.password)
			if(req.body.name === JSONDatabaseLine.name) {
				if (found != "true") {
					found = "true";
					//console.log("admin_login = " + admin_login);
					gridSize.push(JSONDatabaseLine.rows);
					gridSize.push(JSONDatabaseLine.columns);
					res.send(JSON.stringify(gridSize));
				}
			}
		}
	});
});

app.get('/getCarParkDropdown', function(req, res) {
	const CarParkData = fs.readFileSync('CarParkDatabase.json', 'UTF-8');
	const lines = CarParkData.split(/\r?\n/);
	var CarParkArray = [];
	lines.forEach(function(line) {
		if(line.length > 2) {
			line = line.replace(/\r?\n|\r/g, "");
			// console.log(line);
			var CarParkJSON = JSON.parse(line);
			CarParkArray.push(CarParkJSON.name);
		}
	});
	res.send(JSON.stringify(CarParkArray));
});


/*
*
*	Bookings.	
*
*/


app.post('/getBookings', urlencodedParser, function(req, res) {
	const CarParkData = fs.readFileSync('CarParkDatabase.json', 'UTF-8');
	const lines = CarParkData.split(/\r?\n/);
	var SpaceArray = [];
	lines.forEach(function(line) {
		if(line.length > 2) {
			line = line.replace(/\r?\n|\r/g, "");
			// console.log(line);
			var CarParkJSON = JSON.parse(line);
			if (req.body.name === CarParkJSON.name) {
				var sortedDatabase = sortSpaceDatabase(CarParkJSON.spaceArray);
			sortedDatabase.forEach((line) => {
				if(line.reserved == "true") {
					SpaceArray.push(1);
				} else if (line.reserved == "false") {
					SpaceArray.push(2);
				} else if (line.reserved == "road") {
					SpaceArray.push(3);
				}
				else{
					SpaceArray.push(4);
				}
			});
			}
		}
	});
	res.send(JSON.stringify(SpaceArray));
	/*const spaceData = fs.readFileSync('spaceDatabase.json', 'UTF-8');
	const lines = spaceData.split(/\r?\n/);
	const senderArray = [];
	counter = 0;
	var sortedDatabase = sortSpaceDatabase();
	sortedDatabase.forEach((line) => {
		if(line.reserved == "true") {
			senderArray.push(1);
		} else if (line.reserved == "false") {
			senderArray.push(2);
		} else if (line.reserved == "road") {
			senderArray.push(3);
		}
		else{
			senderArray.push(4);
		}
	});
	res.send(JSON.stringify(senderArray));
	*/
});

// Sort server grid.
function sortSpaceDatabase(senderArray) {	
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
		//console.log(JSONObject);
	});	
	return senderArray;
};

/*
*
*	User buttons.
*
*/

app.post('/bookSpace', function(req, res){
	console.log("Book Space active!");
	const spaceData = fs.readFileSync('CarParkDatabase.json', 'UTF-8');
	const lines = spaceData.split(/\r?\n/);
	var temp = [];
	lines.forEach((line) => {
		if(line.length > 5)
			// console.log("Line: " + line);
			line = line.replace(/\r?\n|\r/g, "");
			var DatabaseLine = JSON.parse(line);
			//console.log(req.body.name == DatabaseLine.name);
			if (req.body.name == DatabaseLine.name) {
				console.log("LINE ===== " + DatabaseLine);
				//console.log("DatabaseLine.length = " + DatabaseLine.length);
				//if (DatabaseLine.length > 0)
				//{
					//var JSONline = JSON.parse(DatabaseLine.spaceArray);
					// Find space in database.
					//console.log("DatabaseLine.spaceArray.length = " + DatabaseLine.spaceArray.length);

					DatabaseLine.spaceArray.forEach((currentSpace) => {

						// console.log(" i < DatabaseLine.spaceArray.length = " + currentSpace < DatabaseLine.spaceArray.length);
						// console.log(currentSpace);
						// console.log("req.body.positionX = " + req.body.positionX);
						// console.log("DatabaseLine.spaceArray[i].positionX = " + DatabaseLine.spaceArray.positionX);
						// console.log(" req.body.positionX == DatabaseLine.spaceArray[i].positionX " + req.body.positionX == DatabaseLine.spaceArray.positionX);
						if(req.body.positionX == currentSpace.positionX) {
							console.log("X Equals");
							if(req.body.positionY == currentSpace.positionY) {
								console.log("Found Reserved Space!");
								//edit the server file
								console.log("Before : " + currentSpace.reserved);
								currentSpace.reserved = 'true';
								console.log("After : " + currentSpace.reserved);
							}
						}
						updatedSpace = JSON.stringify(currentSpace);
						console.log("current space: " + updatedSpace);
						temp.push(updatedSpace);
						console.log("ARRAY HERE " + temp);
					});
			}
			updatedTemp = JSON.stringify(temp);
			parsedArray = JSON.parse(updatedTemp);
			console.log("PARSED ARRAY : " + JSON.parse(updatedTemp));
		
			fs.writeFile('spaceDatabase.json', "", function(err, result) {
				console.log("Cleared spaceDatabase");
				if(err) console.log('error', err);
			});

			console.log("Adding parsed array");
			appendToFile('spaceDatabase.json', "[" + parsedArray[0] + ",");
			for(var i = 1; i < parsedArray.length - 2; i++){
				appendToFile('spaceDatabase.json', parsedArray[i] + ",");
			}
			appendToFile('spaceDatabase.json', parsedArray[parsedArray.length - 1] + "]");
	});
	temp = null;
	sendArray = [];
	sendArray.push(req.body.positionX);
	sendArray.push(req.body.positionY);
	res.send(JSON.stringify(sendArray));
});


// function to return space information.
function findSpace(positionX, positionY, CarParkName){
	const DatabaseData = fs.readFileSync("CarParkDataBase.json", 'UTF-8');
	const lines = DatabaseData.split(/\r?\n/);
	const senderData = [];
	lines.forEach((line) => {
		line = line.replace(/\r?\n|\r/g, "");
		if (line.length > 2)
		{
			var CarParkLine = JSON.parse(line); // Database
			if(CarParkName == CarParkLine.name) {
				for(var i = 0; i < CarParkLine.spaceArray.length; i++) {
					//console.log(positionY == CarParkLine.spaceArray[i].positionY);
					if(positionY == CarParkLine.spaceArray[i].positionY) {
						//console.log("True!");
						if(positionX == CarParkLine.spaceArray[i].positionX) {
							senderData.push(CarParkLine.spaceArray[i].positionX);
							senderData.push(CarParkLine.spaceArray[i].positionY);
							senderData.push(CarParkLine.spaceArray[i].cost);
							senderData.push(CarParkLine.spaceArray[i].timing);
							senderData.push(CarParkLine.spaceArray[i].reserved);
							//console.log("Found the space!");
						}
					}
				}
			}
		}
	});
	//console.log(senderData);
	return senderData;
}

// Get car park when booking.
app.post('/gatherSpaceInformation',urlencodedParser, function(req, res){
	var errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
	} 
	else {
		// spaceDatabase current file.
		//console.log("Sent: " + req.body.name);
		//console.log("Sent: " + req.body.positionX);
		//console.log("Sent: " + req.body.positionY);
		var foundSpace = findSpace(req.body.positionX, req.body.positionY, req.body.name);
		res.send(JSON.stringify(foundSpace));
	}
});

app.listen(config.port, function() { 
	console.log('Express app listening on port ', config.port); 
}); 
