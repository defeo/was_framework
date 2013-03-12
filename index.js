/* Dependencies */
var express = require('express');
var cons = require('consolidate');
var path = require('path');
var mysql = require('mysql');
var sqlite = require('node-sqlite-purejs');
var SqlString = require('mysql/lib/protocol/SqlString');

/* Substitute exports with createServer */
exports = module.exports = createServer;
exports.createServer = createServer;

/* Export express */
exports.express = express;
exports.connect = express;

/* Some default configuration */
function Options(opt) {
    this.static_dir = opt.static_dir || path.resolve(require.main.filename, '../static');
    this.static_mount = opt.static_mount || '/static';
    this.template_dir = opt.template_dir || path.resolve(require.main.filename, '../templates');
    this.default_handler = opt.default_handler || exports.not_found_handler;
    this.separator = opt.separator || '---------------------------------';
    this.secret = opt.secret || 'WAS';
    this.port = opt.port || 8080;
    this.db = opt.db;
}

/* 
   This function creates an express app.
*/
function createServer(options) {
    var opt = new Options(options || {});

    var app = express();
    // Import configuration
    for (var o in opt) {
	app.set(o, opt[o]);
    }
    // Default middleware
    app.use(express.favicon())
	.use(express.query())
	.use(express.bodyParser())
	.use(express.cookieParser())
	.use(express.session( {secret: opt.secret } ))
	.use(opt.static_mount, express.static(opt.static_dir))
    // Template engines
    app.engine('mustache', cons.hogan)
	.engine('mu', cons.hogan)
	.set('view engine', 'mustache')
	.set('views', opt.template_dir);
    // Custom middleware
    app.use(exports.logger(opt.separator))
	.use(set_cookie)
	.use(exports.fun_router(app));

    app.start = startServer;
    
    return app;
}

/*
  This function connects to the database (it the app uses one), then
  starts the server.

  The port to listen on can be given as first argument.  The second
  argument is a configuration object for the database, using the same
  syntax as in the Options object. Both arguments are replaced with
  the app's options if not given.

  The thid argument is a callback(err) to be executed after the server
  is started or an error occurs.
*/
function startServer(port, db, next) {
    var app = this;
    var port = port || app.get('port');
    var db = db || app.get('db');

    if (!(next instanceof Function)) {
	next = function(err) {
	    if (err) console.log(err);
	}
    }

    // Starts the server on the requested port
    // (called after the connection to the database).
    var db_callback = function(err, db) {
	if (err) {
	    next(err);
	} else {
	    // this is executed only with the node-sqlite-purejs driver
	    if (typeof db == 'Sql') {
		app.db = db;
		// Use the query escaping facilities of mysql
		app.db.escape = SqlString.escape;
		app.db.escapeId = SqlString.escapeId;
		app.db.format = SqlString.format;
		// Wrap exec with a signature similar to mysql's
		// prepared queries
		app.db.query = function(sql, values, callback) {
		    if (values instanceof Function) {
			callback = values;
		    } else {
			sql = app.db.format(sql, values);
		    }
		    app.db.exec(sql, callback);
		}
		app.db.end = function() {};
	    }

	    // Add one last handler for unrouted requests
	    app.use(app.get('default_handler'));

	    // Start the server
	    app.listen(port, function(err) {
		    if (err) {
			next(err);
		    } else {
			console.log("Server started successfully on port", port);
			console.log();
			next();
		    }
		});
	}
    }

    // Connect to the database if requested
    if (db) {
	if (db.type == 'mysql') {
	    app.db = mysql.createConnection(db);
	    app.db.connect(db_callback);
	} else if (db.type == 'sqlite') {
	    sqlite.open(db.file, db, db_callback);
	} else {
	    next(new Error("Unknown database type: " + db.type));
	}
    } else {
	// Directly start the server
	db_callback();
    }

    return app;
}



/****************** MIDDLEWARE *****************/


/*
  Default fallback handler. It sends a 404 error.
*/
exports.not_found_handler = function(req, res) {
    res.send(404, "Error 404. Could not find a handler for your request.");
}

/*
  This middleware logs useful information to the console
*/
exports.logger = function(separator) {
    var sep = separator || '';
    var _done = express.logger('HTTP/:http-version :status :response-time ms\\n' + sep);
    return function(req, res, next) {
	_done(req, res, function(err) {
	    if (err) return next(err);
	    console.log();
	    console.log(sep);
	    console.log(Date());
	    console.log(req.method, req.url, 'HTTP/' + req.httpVersion);
	    for (h in req.headers) {
		console.log(h + ': ' + req.headers[h]);
	    }
	    console.log();
	    console.log('req.query (query string):', req.query);
	    console.log('req.body (POST content):', req.body);
	    console.log('req.cookies (Cookies):', req.cookies);
	    console.log('req.session (Session):', req.session);
	    console.log();
	    next();
	});
    }
}

/*
  Adds an alias for res.cookie
*/
function set_cookie(req, res, next) {
    res.setCookie = res.cookie;
    next();
}

/*
  Function name based router. It parses the request path and looks
  for a callable in the app.routes object. Slashes in the path
  are translated to dots.
*/
exports.fun_router = function(app) {
    app.f_routes = {};
    return function(req, res, next) {
	var mod = req.path.split('/');
	mod = mod.filter(function(x) { return /^[a-zA-Z0-9_]+$/.test(x) });
	if (mod.length > 0) {
	    var handler = res.app.f_routes;
	    for (comp in mod)
		handler = handler ? handler[mod[comp]] : undefined;
	    if (handler instanceof Function) {
		handler(req, res, next);
	    } else {
		next();
	    }
	} else {
	    next();
	}
    }
}

