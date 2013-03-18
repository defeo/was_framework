// Default configuration for database
// (usually this goes in a separate file)
exports.sqlite_config = {
    type: 'sqlite',
    file: 'app.db',
    create_query: 'create table users (id text not null primary key, pwd text not null, email text not null unique)'
};
// edit this with your MySql database config
exports.mysql_config = {
    type: 'mysql',
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'root',
    create_query: 'create table users (id varchar(255) primary key, pwd varchar(255) not null, email varchar(255) not null unique)'
};

// Get list of users
exports.get_user_list = function(req, cb) {
    req.app.db.query('select * from users', cb);
};

// Get single user
exports.get_user = function(req, cb) {
    req.app.db.query('select * from users where id=?',
		     req.query.id, cb);
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
		if (err.code == 'ER_DUP_ENTRY' ||         // MySQL
		    /^SQLite exception: 19/.test(err)) {  // SQLite
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


// This function is not for responding HTTP requests.
// It creates the table
exports.create = function(app) {
    app.db.query('drop table users', function(err) {
	app.db.query(app.get('db').create_query, function(err) {
	    if (err)
		console.error(err);
	    else
		console.log('Table created successfully.');
	});
    });
};

