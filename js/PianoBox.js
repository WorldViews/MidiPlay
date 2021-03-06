
// A garden with flowers representing Git repos for an organization
//
"use strict"

class PianoKey extends CanvasTool.RectGraphic {
    onClick() {
        this.pianoBox.playMidiNote(this.midiId);
        //this.pianoBox.highlightKey(this.midiId - 40);
        return true;
    }
}

class PianoBox extends CanvasTool.RectGraphic {
    constructor(opts) {
        opts = opts || {};
        opts.instrument = "harpsichord";
        opts.instrument = "acoustic_grand_piano";
        super(opts);
        //this.fillStyle = "salmon";
        this.fillStyle = null;
        this.strokeStyle = null;
        var inst = this;
        this.notes = [];
        this.addItems();
    }

    draw(canvas, ctx) {
        super.draw(canvas, ctx);
        //console.log("Adding note graphics...");

    }

    clearNotes() {
        console.log("clear notes");
    }

    addNote(t, dur, pitch) {
        return;
        var i = pitch - 40;
        let key = this.keys[i];
        if (!key) {
            console.log("no key", i);
            return;
        }
        var heightPerSec = 50;
        var dx = 10;
        console.log("addNote", t, dur, pitch);
        var x = key.x;
        var y = this.y + 20 + t*heightPerSec;
        var height = dur*heightPerSec;
        var note = new CanvasTool.RectGraphic({x, y, height, width: 6})
        this.notes.push(note);
        this.gtool.addGraphic(note);
    }

    onClick() {
        this.init();
    };

    async init() {
        if (this.started)
            return;
        this.started = true;
    }

    playMidiNote(id) {
        playNote(id);
        //super.playMidiNote(id);
        this.highlightKey(id - 40);
    }
    // this is called by the sequencer when a note gets played from
    // the score.
    observeNote(channel, pitch, vel, t, dur) {
        var inst = this;
        //console.log("play note", channel, pitch, vel, dur, t);
        var i = pitch - 40;
        this.highlightKey(i, dur);
    }

    onMidiMessage(midiId, dsId, vel, sound) {
        super.onMidiMessage(midiId, dsId, vel, sound);
        console.log("PianoBox.onMidiMessage", dsId, vel, sound);
        var i = dsId - 41;
        this.highlightKey(i, 0.5);
    }

    highlightKey(i, dur) {
        let key = this.keys[i];
        if (!key) {
            console.log("no note for", i);
            return;
        }
        key.fillStyle = key.highlightColor;
        setTimeout(() => {
            //console.log("set style", i, prevStyle);
            key.fillStyle = key.color;
        }, 500)    ;   
    }

    async addItems() {
        console.log("PianoBox.addItems");
        var opts = { x: this.x, y: this.y, id: "pianobox1" };
        var inst = this;
        var numKeys = 68;
        var whiteKeyWidth = 18;
        var blackKeyWidth = 12;
        var spacing = 20;
        var x0 = this.x - numKeys * spacing / 3.3;
        this.xkey0 = x0;
        var pattern = ["white", "black", "white", "black", "white", "black", "white",
            "white", "black", "white", "black", "white"]
        var x = x0;
        var prevColor = null;
        var id;
        var bkeys = [];
        var wkeys = [];
        this.keys = [];
        for (var i = 0; i < numKeys; i++) {
            var j = i % 12;
            var color = pattern[j];
            if (color == prevColor)
                x += spacing;
            else
                x += spacing / 2;
            prevColor = color;
            var opts;
            var key;
            if (color == "white") {
                id = "wkey" + i;
                opts = {
                    id, x, y: this.y, width: whiteKeyWidth, height: 100,
                    lineWidth: 1, fillStyle: color, strokeStyle: "black"
                };
                key = new PianoKey(opts);
                key.color = color;
                key.highlightColor = "pink";
                wkeys.push(key);
            }
            else {
                id = "bkey" + i;
                opts = {
                    id, x, y: this.y -30, width: blackKeyWidth, height: 50,
                    lineWidth: 1, fillStyle: color, strokeStyle: "black"
                };
                key = new PianoKey(opts);
                key.color = color;
                key.highlightColor = "brown";
                //console.log("add piano key", id);
                bkeys.push(key);
            }
            key.midiId = i+40;
            key.pianoBox = this;
            this.keys.push(key);
            //this.gtool.addGraphic(key);
        }
        //var gtool = this.gtool;
        console.log("adding key graphics");
        //wkeys.forEach(key => gtool.addGraphic(key));
        //bkeys.forEach(key => gtool.addGraphic(key));
        wkeys.forEach(key => inst.addGraphic(key));
        bkeys.forEach(key => inst.addGraphic(key));
        this.width = x - x0 + 2*spacing;
    }
}


//# sourceURL=js/PianoBox.js
