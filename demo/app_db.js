// Default configuration for database
// (usually this goes in a separate file)
exports.config = {
    type: 'sqlite',
    file: 'app.db'
}

// Get list of users
exports.get_user_list = function(req, cb) {
    req.app.db.query('select * from users', cb);
};

// Get single user
exports.get_user = function(req, cb) {
    req.app.db.query('select * from users where id=?',
		     req.body.id, cb);
};

// Check that a user id and password correspond
exports.login = function(req, cb) {
    req.app.db.query('select * from users where id=? and pwd=?',
		     [req.body.id, req.body.pwd],
		     function(err, result) {
			 if (!err) {
			     cb(err, result.length != 0);
			 }
			 cb(err);
		     });
};

// Register new user
exports.sign = function(req, cb) {
    if (req.body.email && /[^@]+@[^@]+/.test(req.body.email) &&
	req.body.pwd && req.body.pwd == req.body.pwd2) {
	req.app.db.query('insert into users (id, pwd, email) values (?, ?, ?)', [
	    req.body.email,
	    req.body.pwd,
	    req.body.email
	], cb);
    } else {
	cb(null, false);
    }
}


// This function is not for responding HTTP requests.
// It creates the table
exports.create = function(app) {
    app.db.query('create table users (id, pwd, email)', function(err) {
	if (err)
	    console.error(err);
	else
	    console.log('Table created successfully.');
    })
}

