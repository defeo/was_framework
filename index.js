/* Dependencies */
var connect = require('connect');
var cookies = require('cookies');
var fs = require('fs');
var path = require('path');

/* Substitute exports with createServer */
exports = module.exports = createServer;
exports.createServer = createServer;

/* More dependencies, exported */
exports.url = require('url');
exports.mustache = require('mustache');
exports.connect = connect;

exports.routes = {};

/* Some hardcoded configuration */
var stat_dir = path.resolve(require.main.filename, '../static');
var tmpl_dir = path.resolve(require.main.filename, '../templates');

/* 
   This function creates a connect server.
   The optional handler, if given, treats any request
   that is not treated by other handlers.
   The optional secret is used for session cookies.
*/
function createServer(handler, secret) {
    return connect()
	.use(connect.favicon())
	.use(connect.query())
	.use(connect.bodyParser())
	.use(connect.cookieParser())
	.use(connect.session( {secret: secret || 'WAS' } ))
	.use(connect.static(stat_dir))
	.use(exec_handler)
	.use(handler || default_handler)
}

/*
  This function creates a new server using createServer, then 
  starts it on the given port, or 8080 if no port is given.
  The handler and secret parameters are passed down to createServer.
*/
exports.startNewServer = function(port, handler, secret) {
    var port = port || 8080;

    return createServer(handler, secret)
	.listen(port, function(err) {
	    if (!err) {
		console.log("Server started successfully on port", port);
		console.log();
	    }
	});
}

/*
  Default handler used if no handler is given to createServer
*/
function default_handler(req, res, next) {
    res.writeHead(404);
    res.end("404 Not found.");
}

/*
  Function name based router. It parses the request path and looks
  for a callable in the exports.routes object. Slashes in the path
  are translated to dots.
*/
function exec_handler(req, res, next) {
    console.log(Date());
    console.log(req.method, req.url, 'HTTP/' + req.httpVersion);
    console.log('req.query (query string):', req.query);
    console.log('req.body (POST content):', req.body);
    console.log('req.cookies (Cookies):', req.cookies);
    console.log();

    req.path = exports.url.parse(req.url).pathname;

    var ck = new cookies(req, res);
    res.set_cookie = ck.set.bind(ck);

    var mod = req.path.split('/');
    mod = mod.filter(function(x) { return /^[a-zA-Z0-9_]+$/.test(x) });
    if (mod.length > 0) {
	var handler = exports.routes;
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

/*
  Helper function to read a mustache template from a file
  and render it.
*/
exports.renderTemplate = function(filename, obj) {
    var template = fs.readFileSync(path.resolve(tmpl_dir, filename), 'ascii');
    return exports.mustache.render(template, obj);
}
