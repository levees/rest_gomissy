$(document).ready( function() {
  "use strict";
  $('.collapsible').collapsible();
  
  var f=$(".page-topbar").height(),g=window.innerHeight-f;
  $('.navigation').perfectScrollbar();

  // menu toggle button.
  $('#header .menu-toggle').on('click', function() {
    $('#sidebar').toggleClass('on');
  });

  // Photo gallery
  $('.photos').lightGallery({
  	enableTouch: !0
  })
});
