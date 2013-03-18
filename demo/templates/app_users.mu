<div id='main'>
  <table id='users'>
    <tr>
      <th>Id</th>
      <th>Real Name</th>
      <th>Email</th>
      <th>Avatar</th>
    </tr>
    {{#users}}
      <tr>
	<td><a href='/user?id={{id}}'>{{id}}</a></td>
	<td><a href='/user?id={{id}}'>{{name}}</a></td>
	<td><a href='/user?id={{id}}'>{{email}}</a></td>
	<td><a href='/user?id={{id}}'><img src='{{avatar}}' alt='{{id}} avatar'/></a></td>
      </tr>
    {{/users}}
  </table>
</div>
