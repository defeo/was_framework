var mysql = require('mysql');
var MySqlString = require('mysql/lib/protocol/SqlString');

var sqlite = require('node-sqlite-purejs');

// Copy of mysql's SqlString with a modified string escaping method
// specific to Sqlite
var SqliteString = require('./SqlString');
SqliteString.anyToString = function(val) {
    val = val.replace(/'/g, "''");
    return "'"+val+"'";
};

// Connect to database and create app.db object, then call next
exports.db_setup = function(app, db, next) {
    var connect_cb = function(err, db) {
	if (err) {
	    next(err);
	} else {
	    if (db && db instanceof sqlite) {     // Sqlite only
		app.db = db;
		// Use the query escaping facilities of mysql
		app.db.escape = SqliteString.escape;
		app.db.escapeId = SqliteString.escapeId;
		app.db.format = SqliteString.format;
		// Wrap exec with a signature similar to mysql's
		// prepared queries
		app.db.query = function(sql, values, callback) {
		    if (typeof values == 'function') {
			callback = values;
		    } else {
			sql = app.db.format(sql, values);
		    }
		    console.log('SQL query:', sql);
		    app.db.exec(sql, callback);
		};
		app.db.end = function() {};
	    } else {                              // MySql only
		app.db.format = MySqlString.format;
		// Adding some logging 
		var _query = app.db.query;
		app.db.query = function(sql, values, callback) {
		    var _sql = sql;
		    if (typeof values != 'function')
			_sql = app.db.format(sql, values);
		    console.log('SQL query:', _sql);
		    return _query.call(this, sql, values, callback);
		};
	    }
	    next();
	}
    }

    if (db.type == 'mysql') {
	app.db = mysql.createConnection(db);
	app.db.connect(connect_cb);
    } else if (db.type == 'sqlite') {
	sqlite.open(db.file, db, connect_cb);
    } else {
	next(new Error("Unknown database type: " + db.type));
    }
};


