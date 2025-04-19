// convert.js
const midiConverter = require('./miditonotebot.js');
const fs = require('fs');

// Get the MIDI file path from command line arguments
const midiFilePath = process.argv[2]; // expects path like: node convert.js ./my_cool_song.mid

if (!midiFilePath) {
    console.error("Please provide the path to the MIDI file as an argument.");
    console.error("Example: node convert.js ./path/to/your/song.mid");
    process.exit(1);
}

// Create the 'songs' directory if it doesn't exist
if (!fs.existsSync('./songs')) {
    fs.mkdirSync('./songs');
    console.log("Created './songs/' directory.");
}

// Run the conversion
try {
    midiConverter.toNotebot(midiFilePath, (outputPath, error) => {
        if (error) {
            console.error("Conversion failed:", error);
        } else if (outputPath) {
            console.log(`Successfully converted. Output saved to: ${outputPath}`);
            // Note: The original midiFilePath has been deleted by toNotebot
        } else {
             console.error("Conversion finished with no output path and no specific error.");
        }
    });
} catch (e) {
     console.error("An error occurred during conversion setup:", e.message);
}