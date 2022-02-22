
"use strict";

var COLORS = [
  "white",
  "white",
  "black",
  "white",
  "black",
  "white",
  "black",
  "white",
  "white",
  "black",
  "white",
  "black"
];

/*
/    Chord structures

          "maj": [0,4,7]
        , "min": [0,3,7]
        , "min7b5": [0,3,6,10]
        , "dim": [0,3,6]
        , "aug": [0,4,8]
        , "maj7": [0,4,7,11]
        , "min7": [0,3,7,10]
        , "7": [0,4,7,10]
        , "minmaj7": [0,3,7,11]
        , "maj7#5": [0,4,8,11]
        , "dim7": [0,3,6,9]
*/

/*
This is an object that gets dragged around the pad
and when x or y values hit new note positions, plays
the notes.
*/

 var SCALES = [[0,4,7],     // major
	       [0,3,7],     // minor
               [0,3,6,10],  // min7b5 
	       [0,4,7,11],  // maj7   
	       [0,3,7,10],  // min7   
	       [0,4,7,10]]; // 7
		    
// [0,3,6],     // dim    
// [0,4,8],     // aug    
// [0,3,7,11], minmaj7
// [0,4,8,11], maj7#5 
// [0,3,6,9]]  dim7     

var SCALE_NAMES = ["major",
		   "minor",
		   "min7b5",
		   "maj7",
		   "min7",   
		   "7"];


var THIS_SCALE = 0

function nextScale() {
    // this should be a dropdown menu!
    THIS_SCALE = (THIS_SCALE + 1)%SCALES.length;
    console.log("New scale is", SCALE_NAMES[THIS_SCALE]);
    // redraw borders -- I don't know how to call BorderGraphic members from here
}

class Pluck extends CanvasTool.Graphic {
  constructor(opts, mtool) {
    super(opts);
    this.mtool = mtool;
    this.lineWidth = 1;
    this.strokeStyle = 'black';
    this.xnote = null;
    //this.xintervals = [-12, 0, 12];
    //this.xintervals = [-4, 8];
    //this.yintervals = [-6, 6];

      // no intervals for now for sanity checking chords
      this.xintervals = [0];
      this.yintervals = [0];


      
      this.scales = [];

      let chords = [[0,4,7],     // major
		    [0,3,7],     // minor
                    [0,3,6,10],  // min7b5 
		    [0,3,6],     // dim    
		    [0,4,8],     // aug    
		    [0,4,7,11],  // maj7   
		    [0,3,7,10],  // min7   
		    [0,4,7,10]]; // 7
		    
		    // [0,3,7,11], minmaj7
		    // [0,4,8,11], maj7#5 
		    // [0,3,6,9]]  dim7     


      
      // first dimension selects scale;
      // second dimension selects note in scale
      for (let c = 0; c < chords.length; c++){
	  
	  let scale = []
	  for (let note=0; note<12;note++){
	      scale.push("black")
	  }
	  for (let note = 0; note < chords[c].length; note++){
	      scale[chords[c][note]] = "white";
	  }
	  this.scales.push(scale)
      }
      console.log(this.scales)

  }

  setXY(x,y) {
    //  console.log("setXY", x, y)
    this.x = x;
    this.y = y;
    var xnote = this.mtool.xToMidiNote(x);
    if (xnote != this.xnote) {
      var nstr = this.handleNotes(xnote, this.xintervals);
      $("#xnoteStatus").html("xnotes: "+nstr);
    }
    this.xnote = xnote;
    var ynote = this.mtool.yToMidiNote(y);
    if (ynote != this.ynote) {
      var nstr = this.handleNotes(ynote, this.yintervals);
      $("#ynoteStatus").html("ynotes: "+nstr);
    }
    this.ynote = ynote;
  }

  // play notes at the specified intervals from
  // the note position n.
  handleNotes(n, intervals) {
    console.log("handleNotes", n);
    var color = COLORS[n % 12];
    //if (color == "black")
    //  return "";
    var nstr = "";
    for (var k=0; k<intervals.length; k++) {
      var i = intervals[k];
      var note = n + i;
      //if (COLORS[note % 12] == "black")
      if (this.scales[THIS_SCALE][note % 12] == "black")
        continue;
      this.mtool.synth.noteOn(0, note, 50, 0);
      //playNote(note);
      nstr += (note + " ");
    }
    return nstr;
  }

  draw(canvas, ctx) {
    //console.log("cursor draw");
    var inst = this;
    super.draw(canvas, ctx);
    this.drawCircle(canvas, ctx, 5, this.x, this.y);
    this.xintervals.forEach(iv => {
      var x = this.x + iv*this.mtool.dxPerNote;
      this.drawVerticalLine(canvas, ctx, x);
    })
    //console.log("yintervals", this.yintervals);
    this.yintervals.forEach(iv => {
      var y = this.y + iv*this.mtool.dyPerNote;
      //console.log("  iv:", iv, "  y:", y);
      this.drawHorizontalLine(canvas, ctx, y);
    })
  }

  drawVerticalLine(canvas, ctx, x) {
    this.drawLine(canvas, ctx, x, -1000, x, 1000);
    this.drawCircle(canvas, ctx, 3, x, this.y);
  }

  drawHorizontalLine(canvas, ctx, y) {
    this.drawLine(canvas, ctx, -1000, y, 1000, y);
    this.drawCircle(canvas, ctx, 3, this.x, y);
  }
}


// This just draws the border around the pad
// It is roughly like piano keys but the spacing
// is a bit different, since each halfnote gets
// the same spacing.
class BorderGraphic extends CanvasTool.Graphic {
  constructor(opts, mtool) {
    super(opts);
    this.mtool = mtool;
    this.lineWidth = 6;
    this.keyHt = opts.keyHt || 40;
    this.strokeStyle = 'black';
  }

  draw(canvas, ctx) {
    //console.log("cursor draw");
    //super.draw(canvas, ctx);
    var keyWd = this.keyHt;
    var keyHt = this.keyHt;
    var x0 = - this.mtool.padWidth/2;
    var x1 = this.mtool.padWidth/2;
    var y0 = this.mtool.padHeight/2;
    var y1 = -this.mtool.padHeight/2;
    //console.log("draw keyWd", keyWd, -this.mtool.padHeight);
    this.lineWidth = 6;
    this.drawHorizontalBorder(canvas, ctx, y0-this.keyHt);
    this.drawHorizontalBorder(canvas, ctx, y1);
    this.drawVerticalBorder(canvas,   ctx, x0);
    this.drawVerticalBorder(canvas,   ctx, x1 - keyWd);
    this.lineWidth = 1;
    this.drawRect(canvas, ctx, x0+keyHt/2, y0-keyHt/2, keyHt, this.keyHt);
    this.drawRect(canvas, ctx, x0+keyHt/2, y1+keyHt/2, keyHt, this.keyHt);
    this.drawRect(canvas, ctx, x1-keyHt/2, y0-keyHt/2, keyHt, this.keyHt);
    this.drawRect(canvas, ctx, x1-keyHt/2, y1+keyHt/2, keyHt, this.keyHt);
  }

  drawHorizontalBorder(canvas, ctx, y) {
    var nnotes = this.mtool.numNotes;
    var keyHt = this.keyHt;

    for (var i = 0; i < nnotes; i++) {
      var n = this.mtool.noteLow + i;
      var x = this.mtool.midiNoteToX(n);
      var j = n % 12;
      this.strokeStyle = COLORS[j];
      //this.strokeStyle = COLORS[j];
      this.drawLine(canvas, ctx, x, y, x, y + keyHt);
    }
  }
  
  drawVerticalBorder(canvas, ctx, x) {
    var nnotes = this.mtool.numNotes;
    var keyWd = this.keyHt;

    for (var i = 0; i < nnotes; i++) {
      var n = this.mtool.noteLow + i;
      var y = this.mtool.midiNoteToX(n);
      var j = n % 12;
      this.strokeStyle = COLORS[j];
      this.drawLine(canvas, ctx, x, y, x+keyWd, y);
    }
  }
}


class MusicTool extends CanvasTool {
  constructor(name, tinySynth, opts) {
    super(name, opts);
    opts = opts || {};
    this.background = '#ccf'
    var ctx = this.ctx;
    this.ts = tinySynth;
    this.synth = tinySynth.synth;
    ctx.strokeStyle = "white";
    ctx.globalAlpha = .85;
    this.user = null;
    this.initGUI();
    this.lockZoom = true;
    this.lockPan = true;
    this.noteLow = 0;
    this.numNotes = 100;
    this.padWidth = 800;
    this.padHeight = 800;
    this.dxPerNote = this.padWidth / this.numNotes;
    this.dyPerNote = this.padHeight / this.numNotes;
    this.setView(0, 0, this.padWidth, this.padHeight);
    var keyHt = 40;
    var border = new BorderGraphic({id: 'border', x: 0, y: this.padHeight/2-keyHt, keyHt }, this);
    var border = new BorderGraphic({id: 'border', keyHt }, this);
    this.addGraphic(border);
    this.pluck = new Pluck({id: 'pluck'}, this);
    this.addGraphic(this.pluck)
  }

  xToMidiNote(x) {
    var x0 = - this.padWidth / 2;
    return this.noteLow + Math.floor((x - x0)/this.dxPerNote + 0.5);
  }

  midiNoteToX(n) {
    var x0 = - this.padWidth / 2;
    return x0 + (n - this.noteLow) * this.dxPerNote;
  }

  yToMidiNote(y) { return this.xToMidiNote(y); }
  midiNoteToY(n) { return this.midiNoteToX(y); }

  initGUI() {
    var inst = this;
    //$("#save").click(e => inst.downloadGardenObj());
    var dropzone = "#" + this.canvasName;
    $(dropzone).on('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    $(dropzone).on('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    $(dropzone).on('drop', (e) => inst.handleDrop(e));
  }

  start() {
    var inst = this;
    super.start();
  }

  mouseMove(e) {
    super.mouseMove(e);
  }

  tick() {
    super.tick();
    //console.log("MusicTool.tick");
  }

  handleMouseDrag(e) {
    super.handleMouseDrag(e);
    var pt = this.getMousePos(e);
    //console.log("drag", pt);
    this.pluck.setXY(pt.x, pt.y);
  }

  handleMouseDown(e) {
    if (e.which != 1)
      return;
    this.handleMouseDrag(e);
  }

  handleDrop(e) {
    var inst = this;
    console.log("handleDrop", e);
    window.Exxx = e;
    e.preventDefault();
    e.stopPropagation();
    if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
      console.log("handle fild data");
      e.preventDefault();
      e.stopPropagation();
      var files = e.originalEvent.dataTransfer.files;
      if (files.length > 1) {
        alert("Cannot handle multiple dropped files");
        return;
      }
      var file = files[0];
      console.log("file", file);
      console.log("files", e.originalEvent.dataTransfer.files)
      var reader = new FileReader();
      reader.onload = (e) => {
        var jstr = reader.result;
        console.log("got jstr", jstr);
        var data = JSON.parse(jstr);
        console.log("data", data);
        inst.clear();
        //inst.loadGarden(data);
      };
      var txt = reader.readAsText(file);
    }
    else {
      //alert("other drop event");
      const lines = e.originalEvent.dataTransfer.getData("text/uri-list").split("\n");
      lines.forEach(async line => {
        console.log("*** line", line);
        var url = line;
        //await inst.addURL(url);
      });
    }
  }


}

