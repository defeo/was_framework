<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8' />
  <title>{{title}}</title>
  <link rel='stylesheet' src='/static/style.css' />
  {{#styles}}
    <link rel='stylesheet' src='/static/{{src}}' />
  {{/styles}}
  <script src='http://code.jquery.com/jquery-1.9.1.min.js'></script>
  {{#scripts}}
    <script src='/static/{{src}}'></script>
  {{/scripts}}
</head>
<body>
  <div id='header'>
    <a href='/'><h1>My App</h1></a>
    <a href='/'><img width='245' height='66' id='logo' src='/static/logo.png' alt='Node.js Logo' /></a>
  </div>
  {{#session.loggedin}}
    <div id='user'><p><a href='/user?id={{id}}'>{{id}}</a>, 
	<a href='/logout'>logout</a></p>
    </div>
  {{/session.loggedin}}
