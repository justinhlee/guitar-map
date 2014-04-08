/*global $:false, Backbone*/
/*jshint indent:2*/

'use strict';

$(function() {
  /* 
    Chord Model
  */
  var Chord = Backbone.Model.extend({
    defaults: function() {
      return {
        name: 'no chord',
        // Position of root note on E string
        root: 0,
        positions: [],
        current: false
      };
    }
  });

  /* 
    Chord View
  */
  var ChordView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (this.model.get('current')) {
        this.$el.html( this.model.get('name') + ' ←' );

      } else {
        this.$el.html( this.model.get('name') );
      }
      var canvas = $('canvas')[0], ctx = canvas.getContext('2d');
      var notes = this.model.get('positions');
      ctx.fillStyle = 'rgba(0,0,0,' + 1.0/Chords.length + ')';
      for (var i = 0; i < notes.length; i++) {
        var fret = notes[i].fretNo;
        var str  = notes[i].stringNo;
        drawNote(ctx, fret, str);
      }
      return this;
    }
  });

  /* 
    Chord Collection
  */
  var ChordProgression = Backbone.Collection.extend({
    model: Chord,

    localStorage: new Backbone.LocalStorage('all-chords'),
  });

  var Chords = new ChordProgression;

  /* 
    Guitar App View (main UI)
  */
  var GuitarView = Backbone.View.extend({
    el: $('#guitar-app'),

    events: {
      'keypress #new-chord' : 'addOnEnter'
    },

    initialize: function() {
      this.canvas = $('canvas')[0];
      if (this.canvas.getContext) {
        this.render();
      }
      this.input = this.$('#new-chord');
      this.listenTo(Chords, 'add', this.addChord);
    },
    
    render: function() {
      var ctx = this.canvas.getContext('2d');
      drawStrings(ctx);
    },

    addOnEnter: function(e) {
      if (e.keyCode != 13) return;
      var isCurrent = (Chords.length === 0);
      var chordName = this.input.val();
      if (getFingerPositions(chordName).length === 0) {
        this.input.val('');
        return;
      }

      Chords.create(new Chord({
        name: this.input.val(),
        positions: getFingerPositions(this.input.val()),
        current: isCurrent
      }));
      this.input.val('');
    },

    addChord: function(toBeAdded) {
      var addedChord = new ChordView({model: toBeAdded}); 
      this.$('#chord-list').append(addedChord.render().el);
    }
  });

  var app = new GuitarView;
});


/* 
* Helper functions for drawing 
*/

var fretDistance   = 74.9;
var stringDistance = 35;

function Position(fretNo, stringNo) {
  this.fretNo   = fretNo;
  this.stringNo = stringNo;
}

function getFingerPositions(name) {
  var root = getRootPosition(name.charAt(0));
  // index to start parse of chord type e.g. maj, min, etc
  var index = 1;

  if (name.length > 1 && name.charAt(1) === '#') {
    root++;
    index++;
  }

  if (name.length > 1 && name.charAt(1) === 'b') {
    root--;
    index++;
  }

  if (name.substring(index) === 'min7') {
    var p1 = new Position(root,1);
    var p2 = new Position(root,3);
    var p3 = new Position(root,4);
    var p4 = new Position(root,5);  
    var ps = [p1,p2,p3,p4];
    return ps;
  }
  if (name.substring(index) === 'maj7') {
    var p4 = new Position(root,5);
    var p3 = new Position(root+1,4);
    var p2 = new Position(root+1,3);
    var p1 = new Position(root,1);
    var ps = [p1,p2,p3,p4];
    return ps;
  }
  return [];
}

function getRootPosition(note) {
  switch (note) {
    case 'E':
      return 0;
    case 'F':
      return 1;
    case 'G':
      return 3;
    case 'A':
      return 5;
    case 'B':
      return 7;
    case 'C':
      return 8;
    case 'D':
      return 10;
  }
}

function drawStrings(fretboard) {
  for (var i = 0; i < 6; i++) {
    fretboard.strokeStyle = '#E36B2A';
    fretboard.lineWidth = 0.5;
    fretboard.beginPath();
    fretboard.moveTo(0, i*stringDistance);
    fretboard.lineTo(1000, i*stringDistance+1);
    fretboard.closePath();
    fretboard.stroke();
  }
  for (var i = 0; i < 13; i++) {
    if (i == 0) {
      fretboard.lineWidth = 10;
      fretboard.strokeStyle = 'gray';
    } else {
      fretboard.lineWidth = 1;
      fretboard.strokeStyle = 'gray';
    }
  
    fretboard.beginPath();
    fretboard.moveTo(i*fretDistance+1, 0);
    fretboard.lineTo(i*fretDistance+1, stringDistance * 5);
    fretboard.closePath();
    fretboard.stroke();
    if (i === 3 || i === 5 || i === 7 || i === 12) {
      var x = i * fretDistance - (fretDistance/2 - 1);
      var y = stringDistance * 5 ;
      fretboard.arc(x,y, 5, 0, Math.PI*2, true);
      fretboard.fillStyle = 'gray';
      fretboard.fill();
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

