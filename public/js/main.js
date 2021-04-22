jQuery(document).ready(function($) {        

const scrollTopBtn = document.getElementById('scrollTopBtn');

scrollTopBtn.addEventListener("click", function (){
  window.scrollTo(0,0);
});



$(document).scroll(function() {
  var y = $(this).scrollTop();
  if (y > 800) {
    $('#scrollTopBtn').fadeIn();
  } else {
    $('#scrollTopBtn').fadeOut();
  }


  $('').each(function() {
    var height = $(this).parent().offset().top;
    if (y > height) {
      $(this).fadeIn();
    } else {
      $(this).fadeOut();
    }
  });
});

  });