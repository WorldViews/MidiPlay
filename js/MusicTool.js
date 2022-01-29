
"use strict";

class CursorGraphic extends CanvasTool.Graphic {
  constructor(opts, mtool) {
    super(opts);
    this.mtool = mtool;
    this.lineWidth = 1;
    this.strokeStyle = 'black';
  }

  draw(canvas, ctx) {
    //console.log("cursor draw");
    super.draw(canvas, ctx);
    var x = this.x;
    var y = this.y;
    this.drawLine(canvas, ctx, x, -1000, x, 1000);
    this.drawLine(canvas, ctx, -1000, y, 1000, y);
    this.drawCircle(canvas, ctx, 3, this.x, this.y);
  }
}

class BorderGraphic extends CanvasTool.Graphic {
  constructor(opts, mtool) {
    super(opts);
    this.mtool = mtool;
    this.lineWidth = 6;
    this.strokeStyle = 'black';
  }

  draw(canvas, ctx) {
    //console.log("cursor draw");
    //super.draw(canvas, ctx);
    var colors = [
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
      "black"];
    var wid = 300;
    var x0 = - wid / 2;
    var keywd = 6;
    var keyht = 20;
    var y = this.y;
    var nnotes = 120;
    for (var i = 0; i < nnotes; i++) {
      var x = x0 + i * keywd;
      var j = i % 12;
      this.strokeStyle = colors[j];
      //this.strokeStyle = (i % 2 == 0 ? "white" : "black");
      this.drawLine(canvas, ctx, x, y, x, y + keyht)
    }
  }
}


class MusicTool extends CanvasTool {
  constructor(name, opts, synth) {
    super(name, opts);
    opts = opts || {};
    var ctx = this.ctx;
    this.synth = synth;
    ctx.strokeStyle = "white";
    /*
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = "#333";
    */
    ctx.globalAlpha = .85;
    this.user = null;
    this.initGUI();
    this.lockZoom = true;
    this.lockPan = true;
    //this.addPiano();
    var border = new BorderGraphic({ id: 'top', x: 0, y: 200 }, this);
    this.addGraphic(border);
    var border = new BorderGraphic({ id: 'bottom', x: 0, y: -200 }, this);
    this.addGraphic(border);
    this.cursor = new CursorGraphic({
      id: 'cursor',
      x: 0, y: 0, width: 100, height: 100
    });
    this.addGraphic(this.cursor)
  }

  addPiano() {
    console.log("addPiano");
    var opts = {
      "type": "PianoBox",
      "id": "piano1",
      "name": "Piano Box",
      "lineWidth": 4,
      "fillStyle": "brown",
      "width": 800,
      "height": 100,
      "x": 0,
      "y": -200
    }
    var pianoBox = new PianoBox(opts);
    this.addGraphic(pianoBox);
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
  /*
    draw() {
      super.draw();
      var ctx = this.ctx;
      this.setTransform(ctx);
      var canvas = this.canvas;
      this.drawBoarder(ctx, canvas, 0, 100);
    }
  
    drawBoarder(ctx, canvas) {
  
    }
  */

  handleMouseDrag(e) {
    super.handleMouseDrag(e);
    var pt = this.getMousePos(e);
    //console.log("drag", pt);
    var x = pt.x;
    var y = pt.y;
    this.cursor.x = x;
    this.cursor.y = y;
    var note = Math.floor(80 + x / 10);
    console.log("kx", note);
    if (note != this.note) {
      console.log("note", note);
      playNote(note);
    }
    this.note = note;
  }

  handleMouseDown(e) {
    if (e.which != 1)
      return;
    var x = e.clientX;
    var y = e.clientY;
    var pt = this.getMousePos(e);
  }

  clearCanvas() {
    //var ctx = this.canvas.getContext('2d');
    var ctx = this.ctx;
    var canvas = this.canvas;
    //ctx.resetTransform(); // stupid -- internet explorer doesn't have this
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var drawBorder = false;
    if (drawBorder) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#999';
      ctx.fillStyle = this.background;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      //ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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

