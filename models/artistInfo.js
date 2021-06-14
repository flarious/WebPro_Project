var mongoose = require('mongoose');

var artistInfoSchema = new mongoose.Schema({
    artistName: String,
    artistImage: {
        type: String,
        default: "/resources/images/temp_artistIcon.png"
    },
    contacts: {
        FB: {
            type: String,
            default: "-"
        },
        IG: {
            type: String,
            default: "-"
        },
        YT: {
            type: String,
            default: "-"
        }
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SongInfo'
        }
    ]
});

module.exports = mongoose.model('ArtistInfo', artistInfoSchema);