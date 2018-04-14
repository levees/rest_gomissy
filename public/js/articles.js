
$(document).ready(function() {
  if ($('#content textarea').is('#body'))
    $('#content textarea#body').summernote({
      oninit: function() {
        $('.note-editable').css('min-height','150px');
      }
    });

  // if ($('#content #begin_at').is('#body'))
  //   $('#content #begin_at').datepicker();
  $('.datepicker').datepicker();
});
