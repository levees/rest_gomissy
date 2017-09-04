$(document).ready( function() {
  "use strict";
  var f=$(".page-topbar").height(),g=window.innerHeight-f;
  $('.navigation').perfectScrollbar();

  // menu toggle button.
  $('#header .menu-toggle').on('click', function() { 
    $('#sidebar').toggleClass('on');
  });
});