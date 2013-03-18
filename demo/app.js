var fmwk = require('was_framework');
var app_db = require('./app_db');

var app = fmwk({
    default_route: '/index',
    db: app_db.config
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
	app_db.login(req, function(err, success) {
	    if (err) {
		console.error(err);
		res.send(500, 'Internal Server Error');
	    } else if (success) {
		// todo: populate session
		// If successfully logged in, redirect
		res.redirect(home_page);
	    } else {
		// Show again login page
		res.multiRender(template, {
		    title: title, 
		    session: req.session,
		    id: req.body.id 
		});
	    }
	});
    } else {
	// Show login page
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
	    // todo: same user
	    res.multiRender(['app_head.mu',
		    'app_users.mu',
		    'app_foot.mu'], 
		   {
		       title: 'My cool app - ' + req.session.name,
		       session: req.session,
		       user: result
		   });
	}
    });
});


// sign in
app.f_routes.sign = function(req, res) {
    var title = 'My cool app - Sign in';
    var template = ['app_head.mu', 'app_sign.mu', 'app_foot.mu'];

    if (req.session.loggedin) {
	// If loggedin, redirect to home page
	res.redirect(home_page);
    } else if (req.method == 'POST') {
	app_db.sign(req, function(err, success) {
	    if (err) {
		console.error(err);
		res.send(500, 'Internal Server Error');
	    } else if (success) {
		// todo: populate session
		// If signing was successful, redirect
		res.redirect(home_page);
	    } else {
		// Else, present again sign in form
		res.multiRender(template,
			   {
			       title: title,
			       session: req.session,
			       email: req.body.email
			   });
	    }
	});
    } else {
	// Present sign in form
	res.multiRender(template,
		   {
		       title: title,
		       session: req.session
		   });
    }
};

// logout
app.f_routes.logout = protect(function(req, res) {
    req.session.loggedin = false;
    req.session.id = undefined;
    res.redirect('/');
});

app.start(8080, null, function(err) {
    if (err)
	console.error(err);
    else if (process.argv.length > 2 && process.argv[2] == '--create-db') {
	app_db.create(app);
    }
});

