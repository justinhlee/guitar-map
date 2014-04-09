/*global $:false*/
/*jshint indent:2*/

'use strict';

$( document ).ready( function() {
  var content  = $('.content');
  var menu     = $('#chart');
  var workSec  = $('.chart');
  var menuOpen = false;

  menu.click(function() {
    if (menuOpen) {
      menuOpen = false;
      //menu.html('MENU &#9776;');
    } else {
      menuOpen = true;
      //menu.html('MENU <strong>X</strong>');
    }
    workSec.slideToggle(500);
    content.slideToggle(500);
  });


 
});