$(document).ready(function() {
    $('#loginForm').submit((event) => {
        event.preventDefault();
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
         if(!$('#email').val()){
            $('#error').show();
            $('#closebtnId').show();
            $('#error').html('You must enter email');
            $('#email').focus();
        }
        else if( !emailReg.test( $('#email').val() ) ) {
            $('#error').show();
            $('#closebtnId').show();
            $('#error').html('Please enter valid email id');
            $('#email').focus();
            } 
        else if(!$('#password').val()){
            $('#error').show();
            $('#closebtnId').show();
            $('#error').html('You must enter password');
            $('#password').focus();
        }
        else {
            $('#loginForm').unbind('submit').submit()
            $('#loginForm').trigger('reset');
            $('#error').hide();
            $('#closebtnId').hide();
       
        }
    });
    $('#closebtnId').click(function() {
        $('#closebtnId').hide();
      });
      $('#closebtnId1').click(function() {
        $('#closebtnId1').hide();
      });
    });

    $(document).mouseup(function(e) 
{
    var container = $("#error");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        container.hide();
    }
    var container = $("#error_alert");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        container.hide();
    }
    var container = $("#closebtnId");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        container.hide();
    }
    var container = $("#closebtnId1");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        container.hide();
    }
});
    