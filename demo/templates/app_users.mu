<div id='main'>
  <table id='users'>
    <tr>
      <th>Id</th>
      <th>Real Name</th>
      <th>Email</th>
      <th>Avatar</th>
    </tr>
    {{#users}}
    <a href='/user?id={{id}}'>
      <tr>
	<td>{{id}}</td>
	<td>{{name}}</td>
	<td>{{email}}</td>
	<td><img src='{{avatar}}' alt='{{id}} avatar'/></td>
      </tr>
    </a>
    {{/users}}
  </table>
</div>
