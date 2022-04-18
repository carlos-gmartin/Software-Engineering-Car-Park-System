const express = require('express'); 
const app = express(); 
const fs = require('fs'); 
const config = require('./config');
const pug = require('pug');
const crypto = require('crypto');
const { body,validationResult } = require('express-validator');
const iv = crypto.randomBytes(16);

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

// Send admin page
app.get('/admin', function(req, res) {
	console.log("user");
	var fileSend = config.public_folder + '/admin/admin.pug';
	res.send(pug.renderFile(fileSend));
});

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
			fs.appendFile('database.json', reqJSON, function(err) {
				if (err) {
					console.log("Error Writing to File!");
				} else {
					console.log("Success Writing to File!");
				}
			});
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
			var fileSend = config.public_folder + "/login.pug";
			console.log(JSON.stringify(req.body));
			const userData = fs.readFileSync('database.json', 'UTF-8');
			const lines = userData.split(/\r?\n/);
			lines.forEach((line) => {
				line = line.replace(/\r?\n|\r/g, "");
				if (line.length > 2)
				{
					console.log(line);
					var JSONline = JSON.parse(line);
					console.log(JSONline);
					var user = decrypt(JSONline);
					console.log(user);
					var JSONuser = JSON.parse(user);
					if(req.body.username === JSONuser.username)
					{
						console.log("Username Correct!");
						if (req.body.password === JSONuser.password) {
							console.log("Password Correct!");
							res.send(pug.renderFile(fileSend, {
								server_response: 'Login Successful!'
							}));
						}
					}
				}
			});
			res.send(pug.renderFile(fileSend, {
				server_response: 'Login Unsuccessful!'
			}));
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
