/*global $:false, Backbone*/
/*jshint indent:2*/

'use strict';

$(function() {
  var guitar = Backbone.Model.extend({
    
  });

  var guitarView = Backbone.View.extend({
    el: $('canvas'),

    initialize: function() {
      this.render();
    },
    
    render: function() {
      var canvas = this.el, ctx = canvas.getContext('2d');
      drawStrings(ctx);
      drawNote(ctx, 1, 5);
      drawNote(ctx, 2, 4);
      drawNote(ctx, 2, 3);
  
      ctx.fillStyle = 'rgba(0, 0, 0, .5)';
      drawNote(ctx, 5, 5);
      drawNote(ctx, 5, 4);
      drawNote(ctx, 5, 3);
      drawNote(ctx, 5, 1);
    }
  });

  var app = new guitarView;
});




function drawStrings(fretboard) {
  for (var i = 0; i < 6; i++) {
    fretboard.strokeStyle = '#E36B2A';
    fretboard.beginPath();
    fretboard.moveTo(0, i*25+1);
    fretboard.lineTo(1000, i*25+1);
    fretboard.closePath();
    fretboard.stroke();
  }
  for (var i = 0; i < 12; i++) {
    fretboard.strokeStyle = 'gray';
    fretboard.lineWidth = 3;
    fretboard.beginPath();
    fretboard.moveTo(i*60+1, 0);
    fretboard.lineTo(i*60+1, 125);
    fretboard.closePath();
    fretboard.stroke();
  }
}

function drawNote(fretboard, fretNo, stringNo) {
  stringNo = 6 - stringNo;
  fretboard.beginPath();
  var x = fretNo*60-29;
  var y = stringNo*25+1;
  var radius = 10;
  var startAngle = 0;
  var endAngle = Math.PI*2;
  fretboard.arc(x, y, radius, startAngle, endAngle, true);
  fretboard.fill();
}

