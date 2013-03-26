<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8' />
  <title>{{title}}</title>
  <link rel='stylesheet' href='/static/style.css' />
  {{#styles}}
    <link rel='stylesheet' href='/static/{{.}}' />
  {{/styles}}
  <script src='http://code.jquery.com/jquery-1.9.1.min.js'></script>
  {{#scripts}}
    <script src='/static/{{.}}'></script>
  {{/scripts}}
</head>
<body>
  <div id='header'>
    <a href='http://nodejs.org/'><img width='122' height='33' id='logo' src='/static/logo.png' alt='Node.js Logo' /></a>
    <h1 id="title"><a href='/'>My App</a></h1>
  </div>
  {{#session.loggedin}}
    <div id='user'><p><a id='user-link' href='/user?id={{id}}'>{{id}}</a>, 
	<a href='/logout'>logout</a></p>
    </div>
  {{/session.loggedin}}
