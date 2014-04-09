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
        positions: [],
        current: false,
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
      var fillStyle = 'rgba(43,58,66,1.0)';
      if (this.model.get('current')) {
        this.$el.html( this.model.get('name') + ' ←' );
        fillStyle = 'rgba(43,58,66,0.8)';
      } else {
        this.$el.html( this.model.get('name'));
        fillStyle = 'rgba(43,58,66,0.2)';
      }
      var canvas = $('canvas')[0], ctx = canvas.getContext('2d');
      var notes = this.model.get('positions');

      for (var i = 0; i < notes.length; i++) {
        var fret = notes[i].fretNo;
        var str  = notes[i].stringNo;
        drawNote(ctx, fret, str, fillStyle);
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

  var ChordProgressionView = Backbone.View.extend({
    //collection: Chords,
    el: $('#chord-list'),

    initialize: function() {
      _(this).bindAll('add', 'remove');
      this.children = [];
      this.collection.each(this.add);
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
      this.listenTo(Chords,'change',this.render);
    },

    add: function(chord) {
      var addedChord = new ChordView({model: chord});
      this.children.push(addedChord);
 
      if (this._rendered) {
        $(this.el).append(addedChord.render().el);
      }

    },

    remove: function() {

    },

    render: function() {
      var that = this;
      this._rendered = true;
      var canvas = $('canvas')[0], ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,960,200); // clear canvas
      drawStrings(ctx);
      $(this.el).empty();
 
      _(this.children).each(function(childView) {
        $(that.el).append(childView.render().el);
        return this;
      });
 
      return this;

    }

  });

  

  var Chords = new ChordProgression;

  /* 
    Guitar App View (main UI)
  */
  var GuitarView = Backbone.View.extend({
    el: $('#guitar-app'),

    events: {
      'keypress #new-chord' : 'addOnEnter',   
      'click #prev'         : 'prevChord',
      'click #next'         : 'nextChord'
    },

    initialize: function() {
      this.canvas = $('canvas')[0];
      this.ChordsView = new ChordProgressionView({collection : Chords});
      if (this.canvas.getContext) {
        this.render();
      }
      this.input = this.$('#new-chord');
    },
    
    render: function() {
      this.ChordsView.render();
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
        current: isCurrent,
      }));
      this.input.val('');
    },

    prevChord : function () {
      var index = -Infinity;
      for (var i = Chords.length-1; i >= 0; i--) {
        if (Chords.at(i).get('current') && i > 0) {
          index = i-1;
          Chords.at(i).set('current', false);
        }
        if (index === i) {
          Chords.at(i).set('current', true);
        }
      }
    },

    nextChord : function () {
      var index = -Infinity;
      for (var i = 0; i < Chords.length; i++) {
        if (Chords.at(i).get('current') && i+1 < Chords.length) {
          index = i+1;
          Chords.at(i).set('current', false);
        }
        if (index === i) {
          Chords.at(i).set('current', true);
        }
      }
    }
  });

  var app = new GuitarView;
});


/* 
* Helper functions for drawing 
*/

var fretDistance   = 79.9;
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

  if (name.substring(index) === 'm') {
    var p1 = new Position(root,1);
    var p2 = new Position(root,2);
    var p3 = new Position(root,3);
    var p4 = new Position(root,4);
    var p5 = new Position(root,5);
    var p6 = new Position(root,6);
    var p7 = new Position(root+2, 2);
    var p8 = new Position(root+2, 3);
    var ps = [p1,p2,p3,p4,p5,p6,p7,p8];
    return ps;
  }

  if (name.substring(index).length === 0) {
    var p1 = new Position(root,1);
    var p2 = new Position(root,2);
    var p3 = new Position(root,3);
    var p4 = new Position(root,4);
    var p5 = new Position(root,5);
    var p6 = new Position(root,6);
    var p7 = new Position(root+2, 2);
    var p8 = new Position(root+2, 3);
    var p9 = new Position(root+1, 4);
    var ps = [p1,p2,p3,p4,p5,p6,p7,p8,p9];
    return ps;
  }

  if (name.substring(index) === 'min7' || 
    name.substring(index) === 'm7') {
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
    fretboard.strokeStyle = '#E74C3C';
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
      fretboard.strokeStyle = '#3F5765';
    } else {
      fretboard.lineWidth = 1;
      fretboard.strokeStyle = '#3F5765';
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
      fretboard.fillStyle = '#3F5765';
      fretboard.fill();
    }
  }
}

function drawNote(fretboard, fretNo, stringNo, fillStyle) {
  stringNo = 6 - stringNo;
  fretboard.beginPath();
  var x = fretNo*fretDistance-(fretDistance/2 - 1);
  var y = stringNo*stringDistance+1;
  var radius = 8;
  var startAngle = 0;
  var endAngle = Math.PI*2;
  fretboard.arc(x, y, radius, startAngle, endAngle, true);

  fretboard.fillStyle = fillStyle;

  fretboard.fill();
}

