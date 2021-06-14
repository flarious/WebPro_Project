var mongoose = require('mongoose');

var songInfoSchema = new mongoose.Schema({
    songName: String,
    artistName: String,
    songImage: {
        type: String,
        default: "/resources/images/temp_songIcon.png"
    },
    songFile: String,
    songLyric: String,
    popularity: Number,
    releaseDate: Date
});

module.exports = mongoose.model('SongInfo', songInfoSchema);