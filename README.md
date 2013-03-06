was_framework
=============

Express-based framework used in the WAS course @UVersailles

Course page at http://swift.prism.uvsq.fr/

Install

```npm install was_framework```

Example

```javascript
var fmwk = require('was_framework');

// Start the app on port 8080
var app = fmwk.startServer();

// Example using the function name based router
app.f_routes.toto = function(req, res) {
    res.send('toto');
}

// Example using a mustache template
app.f_routes.templ = function(req, res) {
    res.render('about.mu');
}
```
