// This script transforms the static page at /user
// into a dynamic page allowing AJAX editing of the
// user properties.
$(function() {
    // This removes the link from the email address
    var $e = $('#email');
    var $a = $e.parent();
    $a.after($e).remove();

    // This attaches the event handlers to the
    // input fields
    $('#name,#id,#email')
	.prop('disabled', false)    // activate the inputs
	.addClass('editable')       // adds a dashed border on mouse over
	.focusin(function() {       // when the element gets focus (click, etc.)
	    $this = $(this);
	    // store old content
	    if (!$this.data('old-value')) {
		$this.data('old-value', $this.val());
	    }
	    // add a solid border
	    $this.addClass('editing');
	}).keydown(function(e) {
	    if (e.which == 13) {    // when the uses presse enter, focus out
		$(this).blur();
		return false;
	    }
	}).focusout(function() {    // when the user leaves the input (click out, etc.)
	    var $this = $(this)
		.removeClass('editing');    // remove solid border

	    // If the data has changed and is validated by the browser
	    // fire an AJAX request
	    if ($this.val() != $this.data('old-value') &&
		$(':valid').is($this)) {
		// temporarily deactivate the input
		$this.prop('disabled', true);
		// fire AJAX
		$.ajax({
		    url: '/update',
		    dataType: 'json',
		    data: {
			column: $this.attr('id'),
			value: $this.val()
		    },
		    // `this` is going to evaluate to $this inside success
		    context: $this,
		    success: ajax_return,
		    error: function(xhr, err, status) {
			// In case of error, call the success calback
			// with a failure message
			ajax_return.call(this, {
			    ok: false,
			    message: 'Unknwon error: ' + err
			}, status, xhr);
		    },
		});
	    }
	});
});

// This function is called when the AJAX request returns
function ajax_return(data, status, xhr) {
    // If the update was successfull
    if (data.ok) {
	// Forget old value
	this.removeData('old-value');
	// Add a green V to the right
	this.parent().next()
	    .off('click')
	    .html('V')
	    .css('color', 'LimeGreen')
	    .attr('title', 'Update OK');

	// If we modified the id
	if (this.attr('id') == 'id') {
	    var url = '/user?id=' + encodeURIComponent(this.val());
	    // update the link in the header...
	    $('#user-link')
		.text(this.val())
		.attr('href', url);
	    // ...and the url in the adress bar
	    history.pushState(null, null, url);
	}
    } else {
	// Add a red X to the right
	var elem = this;
	elem.parent().next()
	    .html('X')
	    .css('color', 'red')
	    .attr('title', data.message)
	    .one('click', function() { 	  // if the X is clicked, restore original data
		elem.val(elem.data('old-value'));
		$(this)
		    .empty()
		    .removeAttr('title');
	    });
    }
    // reactivate the control
    this.prop('disabled', false);
}