was_framework
=============

Express-based framework used in the WAS course @UVersailles

Course page at http://swift.prism.uvsq.fr/

Install

```npm install was_framework```

Example

~~~~ {.javascript}
var fmwk = require('was_framework');

var opts = {
  default_handler: handler
};

// Create and configure application
var app = fmwk(opts);

function handler(req, res) {
  res.send(200, 'Hello world');
}

// Start application on port 12345
app.start(12345);
~~~~

## Recognized options


## Starting the server

The `.start` method accepts as third argument a callback to be
executed after the server has successfully started.

~~~~ {.javascript}
var fmwk = require('was_framework');

var opts = {
  db: {
    type: 'sqlite',
    file: 'app.db'
  }
}

var app = fmwk(opts);

app.start(null, null, function(err) {
  console.log('Server started');
});
~~~~


## Routing

`was_framwork` comes with a *function name based router* to help you map
URLs to JavaScript functions with the least effort. Handlers are
added to the object `app.f_routes`.

~~~~ {.javascript}
var fmwk = require('was_framework');

var opts = {
  // redirect all requests for / to /home
  default_route: '/home';
}

var app = fmwk(opts);

app.f_routes.home = function(req, res) {
  // this function handles requests for /home
};

app.f_routes.fee = function(req, res) {
  // this function handles requests for /fee
};

// You can even nest functions inside objects
app.f_routes.foo = {
  bar: function(req, res) {
    // this function handles requests for /foo/bar
  },

  baz: function(req, res) {
    // this function handles requests for /foo/baz
  }
};

app.start(12345);
~~~~

Besides the function name based router, `was_framework` supports also
the default router of `express` for finer control over
URLs and HTTP methods. Read the documentation of
`express` for more information.


## Hogan.js templates

`was_framework` comes with built-in support for Mustache templates using `hogan.js`.
Mustache templates must be contained in a directory called
`templates`, and must have filename
ending in `.mu` or `.mustache`. Templates are compiled and sent
to the client at once using the `.render` method. 

~~~~ {.javascript}
app.f_routes.home = function(req, res) {
  // Compile Mustache template and send to the user
  res.render('about.mu', { title: 'My cool web app' });
}
~~~~

A feature unique to `was_framework` is the method **`.multiRender`**,
allowing to compile and send multiple templates. It makes a simpler alternative to partials. Here’s an example using
three templates, the compiled HTML is concatenated and sent to the
user.

~~~~ {.javascript}
app.f_routes.home = function(req, res) {
  res.multiRender(['head.mu', 'body.mu', 'foot.mu'], { title: 'My cool web app' });
}
~~~~


## Static files

`was_framework` comes with built-in support for static files. If you
create a directory `static` inside your working directory, any file
contained in it will be available at the URL `/static/filename`.


## Redirections and other HTTP codes

HTTP status code 302 is used for redirection. When the server sends
a code 302 to the client, it also specifies a `Location:` response
header, containing a URL to redirect to. When the client receives a
code 302, it generates a new GET request for the URL specified
by the server. `was_framework` has a facility for redirecting provided
by the `.redirect` method.

~~~~ {.javascript}
app.f_routes.rel_redirect = function(req, res) {
  res.redirect('a/relative/url/');
};

app.f_routes.abs_redirect = function(req, res) {
  res.redirect('/an/absoulte/url/');
}

app.f_routes.full_redirect = function(req, res) {
  res.redirect('http://some.other.site/some/page');
}
~~~~


Other HTTP codes can be sent to the client, along with an arbitrary
message, using the `.send` method. For example, 500 is the code for
Internal Server Error.

~~~~ {.javascript}
app.f_routes.error = function(req, res) {
  res.send(500, '<h1>An unexpected error occured.</h1>');
}
~~~~


## Databases

`was_framework` has builtin support for MySql and SQLite, based on the modules `mysql` and `node-sqlite-purejs`. The
connection to the database is opened automatically before the server is
started. Use an SQLite database like this (if `filename.db` does not
exist, it is created automatically):

~~~~ {.javascript}
var fmwk = require('was_framework');

var opts = {
  db: {
    type: 'sqlite',
    file: 'filename.db'
  }
}

var app = fmwk(opts);

app.start();   // by default, listen on port 8080
~~~~

Use a MySql database like this:

~~~~ {.javascript}
var fmwk = require('was_framework');

var opts = {
  db: {
    type: 'mysql',
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'db'
  }
}

var app = fmwk(opts);

app.start();   // by default, listen on port 8080
~~~~

Are also recognized all the options accepted by the modules
`node-sqlite-purejs` and `mysql`.

After a successfull connection, an `app.db` object is created.

Independently of the driver, `was_framework` tries to provide an API as
consistent as possible with that of the `mysql` module. To
send an SQL query to the database, use the `.query` method of `db`.

~~~~ {.javascript}
app.f_routes.create_table = function(req, res) {
  req.app.db.query('CREATE TABLE test (a TEXT, b TEXT)', function(err) {
    if (err) console.log(err);
  });
};

app.f_routes.select = function(req, res) {
  // Prepared statement (use ?)
  req.app.db.query('SELECT * FROM test WHERE a=? AND b=?', 
                   [req.query.a, req.query.b],
                   function(err, results) {
                     if (err) {
                       console.log(err);
                     } else {
                       for (var i = 0; i < results.length; i++)
                         console.log(results[i]);
                     }
  });
}
~~~~

Prepared queries help you avoid SQL injections. If you want to do the
escaping manually, you can use the methods `app.db.escape` for
values `app.db.escapeId` for column names.

