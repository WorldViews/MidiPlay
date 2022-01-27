
// These are midi note numbers; 48=C3,


//var NOTES = [50,52, 53, 55];
var NOTES = [48, 52, 53, 55, 58];
var SCALE1 = [48, 52, 53, 55, 58, 60];
var SCALE2 = [48, 55];

var IDX = 0;
var idx1 = 0;
var idx2 = 0;

var numNotesPlayed = 0;
var running = 0;


function getRndInt(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
function playOne() {
    numNotesPlayed++;
    var note = NOTES[IDX];
     if (!running)
        return;
    //if (numNotesPlayed > 10)
    //    return;
//    var note = SCALE1[idx1];
    var note = SCALE1[getRndInt(0, SCALE1.length)];
    playNote(note);
    console.log(idx1, note);
    if (idx1 % 2 == 0) {
//	console.log("IDX2");
	idx2 = (idx2+1) % SCALE2.length;
        var note = SCALE2[idx2];
	playNote(note - 12);
    }
    idx1 = (idx1+1) % SCALE1.length;
    setTimeout(playOne, 500)
}

function run() {
    var note = NOTES[2];
    running = true;
    numNotesPlayed = 0;
    playOne();
}

function stop() {
    running = false;
}

