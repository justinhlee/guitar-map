/*global $:false, Backbone*/
/*jshint indent:2*/

'use strict';

$(function() {
  // Constructor for a finger position
  function Position(fretNo, stringNo) {
    this.fretNo   = fretNo;
    this.stringNo = stringNo;
  }

  // Chords have a name and a list of finger positions
  var Chord = Backbone.Model.extend({
    defaults: function() {
      return {
        name: 'no chord',
        // Position of root note on E string
        root: 0,
        positions: []
      };
    }
  });

  var ChordView = Backbone.View.extend({
    el: $('canvas'),

    initialize: function() {
      this.render();
    },

    render: function() {
      var canvas = this.el, ctx = canvas.getContext('2d');
      var notes = this.model.get('positions');
    
      // Iterate through every note of a chord and draw it
      for (var i = 0; i < notes.length; i++) {
        var fret = notes[i].fretNo;
        var str  = notes[i].stringNo;
        drawNote(ctx, fret, str);
      }
    }
  });

  var ChordProgression = Backbone.Collection.extend({
    model: Chord
  });

  var GuitarView = Backbone.View.extend({
    el: $('canvas'),

    initialize: function() {
      this.render();
      /* CHANGE BELOW LINE 

      */
      var p1 = new Position(1,5);
    
      var p3 = new Position(2,3);
      var ps = [p1,p3];
      this.addChord(new Chord({
        name: 'Am7',
        positions: ps
      }));
    },
    
    render: function() {
      var canvas = this.el, ctx = canvas.getContext('2d');
      drawStrings(ctx);

    },

    addChord: function(toBeAdded) {
      var addedChord = new ChordView({model: toBeAdded});
    }
  });

  var app = new GuitarView;
});


/* 
* Helper functions for drawing 
*/

var fretDistance   = 75;
var stringDistance = 35;

function drawStrings(fretboard) {
  for (var i = 0; i < 6; i++) {
    fretboard.strokeStyle = '#E36B2A';
    fretboard.beginPath();
    fretboard.moveTo(0, i*stringDistance+1);
    fretboard.lineTo(1000, i*stringDistance+1);
    fretboard.closePath();
    fretboard.stroke();
  }
  for (var i = 0; i < 13; i++) {
    fretboard.strokeStyle = 'gray';
    fretboard.lineWidth = 3;
    fretboard.beginPath();
    fretboard.moveTo(i*fretDistance+1, 0);
    fretboard.lineTo(i*fretDistance+1, stringDistance * 5);
    fretboard.closePath();
    fretboard.stroke();
    if (i === 3 || i === 5 || i === 7 || i === 12) {
      var x = i * fretDistance - (fretDistance/2 - 1);
      var y = stringDistance * 5 + 20;

      // Put fret markers
    }
  }
}

function drawNote(fretboard, fretNo, stringNo) {
  stringNo = 6 - stringNo;
  fretboard.beginPath();
  var x = fretNo*fretDistance-(fretDistance/2 - 1);
  var y = stringNo*stringDistance+1;
  var radius = 10;
  var startAngle = 0;
  var endAngle = Math.PI*2;
  fretboard.arc(x, y, radius, startAngle, endAngle, true);
  fretboard.fill();
}

