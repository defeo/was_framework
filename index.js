/* Dependencies */
var express = require('express');
var cons = require('consolidate');
var path = require('path');

/* Substitute exports with createServer */
exports = module.exports = createServer;
exports.createServer = createServer;

/* Export express */
exports.express = express;
exports.connect = express;

/* Some hardcoded configuration */
var stat_dir = path.resolve(require.main.filename, '../static');
var stat_mount = '/static';
var tmpl_dir = path.resolve(require.main.filename, '../templates');
var sep = '---------------------------------';

/* 
   This function creates an express app.
   The optional secret is used for session cookies.
*/
function createServer(secret) {
    var app = express();
    // Default middleware
    app.use(express.favicon())
	.use(express.query())
	.use(express.bodyParser())
	.use(express.cookieParser())
	.use(express.session( {secret: secret || 'WAS' } ))
	.use(stat_mount, express.static(stat_dir))
    // Template engines
    app.engine('mustache', cons.hogan)
	.engine('mu', cons.hogan)
	.set('view engine', 'mustache')
	.set('views', tmpl_dir);
    // Custom middleware
    app.use(exports.logger())
	.use(set_cookie)
	.use(exports.fun_router(app));

    return app;
}

/*
  This function creates a new server using createServer, then 
  starts it on the given port, or 8080 if no port is given.

  The optional handler, if given, treats any request that is not
  treated by other handlers. If not given, the default handler
  returning 404 is used.

  The secret parameter is passed down to createServer.
*/
exports.startServer = function(port, handler, secret) {
    var port = port || 8080;

    var app = createServer(secret)
	.use(handler || exports.default_handler);
    app.listen(port, function(err) {
	    if (!err) {
		console.log("Server started successfully on port", port);
		console.log();
	    }
	});
    return app;
}



/****************** MIDDLEWARE *****************/


/*
  Default fallback handler. It sends a 404 error.
*/
exports.default_handler = function(req, res) {
    res.send(404, "Error 404. Could not find a handler for your request.");
}

/*
  This middleware logs useful information to the console
*/
exports.logger = function() {
    var _done = express.logger(':response-time ms\\n' + sep);
    return function(req, res, next) {
	_done(req, res, function(err) {
	    if (err) return next(err);
	    console.log()
	    console.log(sep);
	    console.log(Date());
	    console.log(req.method, req.url, 'HTTP/' + req.httpVersion);
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

