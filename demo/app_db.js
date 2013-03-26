// Get list of users
exports.get_user_list = function(req, cb) {
    req.app.db.query('select * from users', cb);
};

// Get single user
exports.get_user = function(req, cb) {
    req.app.db.query('select * from users where id=?',
		     req.query.id, function(err, result) {
			 cb(err, result.length ? result[0] : null);
		     });
};

// Check that a user id and password correspond
exports.login = function(req, cb) {
    req.app.db.query('select * from users where id=? and pwd=?',
		     [req.body.id, req.body.pwd],
		     function(err, result) {
			 if (!err) {
			     cb(err, result.length == 1 ? result : null);
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
	], function(err, result) {
	    if (err) {
		if (err &&
		    (err.code == 'ER_DUP_ENTRY' ||          // MySQL
		     /^SQLite exception: 19/.test(err))) {  // SQLite
		    // Login already exists, callback with no error
		    cb(null, null, 'Email already has an account.');
		} else {
		    // Any other error
		    cb(err);
		}
	    } else {
		// Account creation successfull
		cb(null, {
		    id: req.body.email,
		    pwd: req.body.pwd,
		    email: req.body.email
		});
	    }
	});
    } else {
	cb(null, null, 'Passwords differ.');
    }
};

// update field
exports.update = function(req, cb) {
    if (['id', 'email', 'name'].indexOf(req.query.column) < 0) {
	cb(null, false, "Unknown column");
    } else if (!req.query.value) {
	cb(null, false, "Emtpy value");
    } else {
	req.app.db.query('update users set ??=? where id=?', 
			 [req.query.column, req.query.value, 
			  req.session.loggedin.id],
			 function(err) {
			     if (err &&
				 (err.code == 'ER_DUP_ENTRY' ||        //MySQL
				  /^SQLite exception: 19/.test(err))) {//SQLite
				     cb(null, null, 'Duplicate entry');
			     } else if (err) {
				 cb(err);
			     } else {
				 var result = {};
				 result[req.query.column] = req.query.value;
				 cb(null, result);
			     }
			 });
    }
};


// This function is not for responding HTTP requests.
// It creates the table
exports.create = function(app) {
    var create_query = app.get('db').type == 'mysql' ?
	'create table users (id varchar(255) primary key, pwd varchar(255) not null, email varchar(255) not null unique, name varchar(255))' :
	'create table users (id text not null primary key, pwd text not null, email text not null unique, name text)';

    app.db.query('drop table users', function(err) {
	app.db.query(create_query, function(err) {
	    if (err)
		console.error(err);
	    else
		console.log('Table created successfully.');
	});
    });
};

