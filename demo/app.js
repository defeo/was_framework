var fmwk = require('was_framework');
var argv = require('attrs.argv');
var app_db = require('./app_db');

// get configuration file path
var conffile = argv.f || 'conf';
var conf = require(conffile[0] == '/' ? conffile : './' + conffile);

var app = fmwk({
    default_route: '/index',
    db: conf.db
});
    

// Wrapper function for login-only pages.
// It redirects to / if the user is not logged in.
var protect = function(fn) {
    return function(req, res) {
	if (req.session.loggedin) {
	    return fn(req, res);
	} else {
	    res.redirect('/');
	}
    };
};
var home_page = '/users';

// home page
app.f_routes.index = function(req, res) {
    var title = 'My cool app';
    var template = ['app_head.mu', 'app_login.mu', 'app_foot.mu'];

    if (req.session.loggedin) {
	// If the user is already logged in, redirect to home page
	res.redirect(home_page);
    } else if (req.method == 'POST') {
	// If the user has sent a login form, try loggin in
	app_db.login(req, function(err, result) {
	    if (err) {
		console.error(err);
		res.send(500, 'Internal Server Error');
	    } else if (result) {
		// populate session
		req.session.loggedin = result[0];
		// If successfully logged in, redirect
		res.redirect(home_page);
	    } else {
		// Show again login page
		res.type('html');
		res.multiRender(template, {
		    title: title, 
		    session: req.session,
		    id: req.body.id,
		    message: 'Wrong username or password.'
		});
	    }
	});
    } else {
	// Show login page
	res.type('html');
	res.multiRender(template, { 
	    title: title,
	    session: req.session
	});
    }
};

// user list
app.f_routes.users = protect(function(req, res) {
    app_db.get_user_list(req, function(err, result) {
	if (err) {
	    console.error(err);
	    res.send(500, 'Internal Server Error');
	} else {
	    res.type('html');
	    res.multiRender(['app_head.mu',
		    'app_users.mu',
		    'app_foot.mu'], 
		   {
		       title: 'My cool app - User list',
		       session: req.session,
		       users: result
		   });
	}
    });
});

// user page
app.f_routes.user = protect(function(req, res) {
    app_db.get_user(req, function(err, result) {
	if (err) {
	    console.error(err);
	    res.send(500, 'Internal Server Error');
	} else {
	    var scripts = (result && result.id == req.session.loggedin.id) ?
		['update_user.js'] : [];
	    res.type('html');
	    res.multiRender(['app_head.mu',
		    'app_user.mu',
		    'app_foot.mu'], 
		   {
		       title: 'My cool app - View user',
		       session: req.session,
		       user: result,
		       scripts: scripts
		   });
	}
    });
});


// update user fields
app.f_routes.update = function(req, res) {
    if (req.session.loggedin) {
	app_db.update(req, function(err, result, message) {
	    if (err) {
		console.log(err)
		res.send(500, 'Internal Server Error');
	    } else {
		if (result) {
		    // update session variables
		    for (k in result)
			req.session.loggedin[k] = result[k];
		    res.json({ ok: true });
		} else {
		    res.json({
			ok: false,
			message: message
		    });
		}
	    }
	});
    } else {
	res.json({
	    ok: false,
	    message: 'Not logged in'
	});
    }
};

// sign in
app.f_routes.sign = function(req, res) {
    var title = 'My cool app - Sign in';
    var template = ['app_head.mu', 'app_sign.mu', 'app_foot.mu'];

    if (req.session.loggedin) {
	// If loggedin, redirect to home page
	res.redirect(home_page);
    } else if (req.method == 'POST') {
	app_db.sign(req, function(err, result, message) {
	    if (err) {
		console.error(err);
		res.send(500, 'Internal Server Error');
	    } else if (result) {
		// populate session
		req.session.loggedin = result;
		// If signing was successful, redirect
		res.redirect(home_page);
	    } else {
		// Else, present again sign in form
		res.type('html');
		res.multiRender(template,
			   {
			       title: title,
			       session: req.session,
			       email: req.body.email,
			       message: message
			   });
	    }
	});
    } else {
	// Present sign in form
	res.type('html');
	res.multiRender(template,
		   {
		       title: title,
		       session: req.session
		   });
    }
};

// logout
app.f_routes.logout = protect(function(req, res) {
    req.session.loggedin = null;
    req.session.destroy();
    res.redirect('/');
});

app.start(argv.port || conf.port || 8080, null, function(err) {
    var create = !argv['no-create-db'] &&
	(argv['create-db'] || conf['create-db'] || 
	 argv['recreate-db'] || conf['recreate-db']);
    var drop = create && 
	(argv['recreate-db'] || conf['recreate-db']);
    
    if (err)
	console.error(err);
    else if (create) {
	app_db.create(app, drop);
    }
});

