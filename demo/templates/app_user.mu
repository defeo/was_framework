<div id='main' class='userpage'>
  {{#user}}
    <table id='name-container'><tr><td>
      <input type='text' id='name' value='{{name}}'
             placeholder='No name' disabled=1 />
    </td><td></td></tr><td></table>

    <!--img width='' height='' id='avatar' src='{{avatar}}' alt='{{id}} avatar'/-->

    <table>
      <tr>
        <td>Id:</td>
	<td><input type='text' id='id' value='{{id}}' disabled=1 /></td>
	<td></td>
      </tr>
      <tr>
        <td>Email:</td>
	<td><a href='mailto:{{email}}'>
	  <input type='email' id='email' value='{{email}}' disabled=1 />
	</a></td>
	<td></td>
      </tr>
    </table>
  {{/user}}
  {{^user}}
    <h3>No users by that name</h3>
  {{/user}}
</div>
