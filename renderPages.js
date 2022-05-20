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