

var NOTES = [50,52, 53, 55];

var IDX = 0;
var numNotesPlayed = 0;
var running = 0;

function playOne() {
    numNotesPlayed++;
    var note = NOTES[IDX];
    IDX = (IDX+1) % NOTES.length;
    if (!running)
        return;
    if (numNotesPlayed > 10)
        return;
    var note = NOTES[IDX];
    playNote(note);
    setTimeout(playOne, 1000)
}

function run() {
    var note = NOTES[2];
    running = true;
    numNotesPlayed = 0;
    playOne();
}

