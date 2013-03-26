$(function() {
    var $e = $('#email');
    var $a = $e.parent();
    $a.after($e).remove();

    $('#name,#id,#email')
	.prop('disabled', false)
	.addClass('editable')
	.focusin(function() {
	    $(this)
		.data('value', $(this).val())
		.addClass('editing');
	}).keydown(function(e) {
	    if (e.which == 13) {
		$(this).blur();
		return false;
	    }
	}).focusout(function() {
	    var $this = $(this)
		.removeClass('editing');
	    // Fire AJAX here
	    if ($this.val() != $this.data('value') &&
		$(':valid').is($this)) {
		$this.prop('disabled', true);
		$.ajax({
		    url: '/update',
		    dataType: 'json',
		    data: {
			column: $this.attr('id'),
			value: $this.val()
		    },
		    context: $this,
		    success: function(data) {
			if (data.ok) {
			    this.parent().next()
				.html('V')
				.css('color', 'LimeGreen')
				.attr('title', 'Update OK');
			} else {
			    this.parent().next()
				.html('X')
				.css('color', 'red')
				.attr('title', data.message);
			}
		    },
		    error: function(xhr, err) {
			this.parent().next()
				.html('X')
				.css('color', 'red')
				.attr('title', 'Unknwon error: ' + err);
		    },
		    complete: function() {
			this.prop('disabled', false);
		    }
		});
	    }
	});
});
