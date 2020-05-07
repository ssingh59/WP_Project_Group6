$(document).ready(function() {
    $('#reservationForm').submit((event) => {
        event.preventDefault();

        if($('#hosplist').val().length == "") {
            $('#error').show();
            $('#closebtnId').show();
            $('#error').html('You must select Hospital.');

        }
        else {
            $('#reservationForm').unbind('submit').submit()
            $('#reservationForm').trigger('reset');
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
  

function test(){
    return true;
}

 function DateRestrict() {
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    if (day < 10) {
        day = '0' + day
    }
    if (month < 10) {
        month = '0' + month
    }

    today = year + '-' + month + '-' + day;
    document.getElementById("resvDate").setAttribute("min", today);
} 