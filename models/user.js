var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    email: String,
    rank: {
        type: String,
        default: "user"
    },
    image: {
        type: String,
        default: "/resources/images/temp_userIcon.png"
    },
    favSongs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SongInfo'
        }
    ],
    favArtists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ArtistInfo'
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);