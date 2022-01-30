
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

class Pluck extends CanvasTool.Graphic {
  constructor(opts, mtool) {
    super(opts);
    this.mtool = mtool;
    this.lineWidth = 1;
    this.strokeStyle = 'black';
    this.note = null;
    this.intervals = [0, 12];
  }

  setXY(x,y) {
    this.x = x;
    this.y = y;
    var note = this.mtool.xToMidiNote(x);
    console.log("kx", note);
    if (note != this.note) {
      console.log("note", note);
      this.handleNotes(note);
    }
    this.note = note;
  }

  handleNotes(n) {
    console.log("handleNotes", n);
    var color = COLORS[n % 12];
    if (color == "black")
      return;
    var nstr = "";
    for (var k=0; k<this.intervals.length; k++) {
      var i = this.intervals[k];
      var note = n + i;
      this.mtool.synth.noteOn(0, note, 50, 0);
      //playNote(note);
      nstr += (note + " ");
    }
    $("#noteStatus").html(nstr);
  }

  draw(canvas, ctx) {
    //console.log("cursor draw");
    var inst = this;
    super.draw(canvas, ctx);
    this.drawCircle(canvas, ctx, 3, this.x, this.y);
    this.drawLine(canvas, ctx, -1000, this.y, 1000, this.y);
    this.intervals.forEach(iv => {
      var x = this.x + iv*this.mtool.dxPerNote;
      this.drawVerticalLine(canvas, ctx, x);
    })
  }

  drawVerticalLine(canvas, ctx, x) {
    var y = this.y;
    this.drawLine(canvas, ctx, x, -1000, x, 1000);
    this.drawCircle(canvas, ctx, 3, x, this.y);
  }
}

class BorderGraphic extends CanvasTool.Graphic {
  constructor(opts, mtool) {
    super(opts);
    this.mtool = mtool;
    this.lineWidth = 6;
    this.keyHt = opts.keyHt || 20;
    this.strokeStyle = 'black';
  }

  draw(canvas, ctx) {
    //console.log("cursor draw");
    //super.draw(canvas, ctx);

    var nnotes = this.mtool.numNotes;
    var keyHt = this.keyHt;
    var y = this.y;

    for (var i = 0; i < nnotes; i++) {
      var n = this.mtool.noteLow + i;
      var x = this.mtool.midiNoteToX(n);
      var j = n % 12;
      this.strokeStyle = COLORS[j];
      this.drawLine(canvas, ctx, x, y, x, y + keyHt);
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
    this.setView(0, 0, this.padWidth, this.padHeight);
    var keyHt = 40;
    var border = new BorderGraphic({id: 'top', x: 0, y: 400-keyHt, keyHt }, this);
    this.addGraphic(border);
    var border = new BorderGraphic({id: 'bottom', x: 0, y: -400, keyHt }, this);
    this.addGraphic(border);
    this.pluck = new Pluck({id: 'pluck'}, this);
    this.addGraphic(this.pluck)
  }

  xToMidiNote(x) {
    var x0 = - this.padWidth / 2;
    var n = this.noteLow + Math.floor((x - x0)/this.dxPerNote + 0.5);
    return n;
  }

  midiNoteToX(n) {
    var x0 = - this.padWidth / 2;
    var x = x0 + (n - this.noteLow) * this.dxPerNote;
    return x;
  }

  clear() {
    super.clear();
  }

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

  /*
  async addItem(item) {
    console.log("addItem", item);
    item.gtool = this;
    var otype = item.type;
    var obj = await createObject(item);
    console.log("addItem got", obj);
    if (obj == null) {
      console.log("Couldn't create", item);
      return;
    }
    if (obj instanceof CanvasTool.Graphic) {
      console.log("obj is graphic");
      this.addGraphic(obj);
    }
  }
  */

  handleMouseDrag(e) {
    super.handleMouseDrag(e);
    var pt = this.getMousePos(e);
    //console.log("drag", pt);
    this.pluck.setXY(pt.x, pt.y);
    /*
    var x = pt.x;
    var y = pt.y;
    this.pluck.x = x;
    this.pluck.y = y;
    //var note = Math.floor(80 + x / 10);
    var note = this.xToMidiNote(x);
    console.log("kx", note);
    if (note != this.note) {
      console.log("note", note);
      playNote(note);
    }
    this.note = note;
    */
  }

/*
  handleMouseDrag(e) {
    super.handleMouseDrag(e);
    var pt = this.getMousePos(e);
    //console.log("drag", pt);
    var x = pt.x;
    var y = pt.y;
    this.pluck.x = x;
    this.pluck.y = y;
    //var note = Math.floor(80 + x / 10);
    var note = this.xToMidiNote(x);
    console.log("kx", note);
    if (note != this.note) {
      console.log("note", note);
      playNote(note);
    }
    this.note = note;
  }
*/

  handleMouseDown(e) {
    if (e.which != 1)
      return;
    var x = e.clientX;
    var y = e.clientY;
    var pt = this.getMousePos(e);
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

