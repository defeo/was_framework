<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8' />
  <title>{{title}}</title>
  <link rel='stylesheet' src='/static/style.css' />
  {{#styles}}
    <link rel='stylesheet' src='/static/{{src}}' />
  {{/styles}}
  <script src='/static/jquery.min.js'></script>
  {{#scripts}}
    <script src='/static/{{src}}'></script>
  {{/scripts}}
</head>
<body>
  <div id='header'>
    <a href='/'><h1>My App</h1></a>
    <a href='/'><img id='logo' src='/static/logo.jpg' alt='My App Logo' /></a>
  </div>
  {{#loggedin}}
    <div id='user'><p><a href='/user?id={{session.id}}'>{{session.id}}</a>, 
	<a href='/logout'>logout</a></p>
    </div>
  {{/loggedin}}
