const   express     = require("express"),
        multer      = require("multer"),
        path        = require("path"),
        storage     = multer.diskStorage({
                        destination: function(req, file, callback){
                            var destination = "./public/uploads/";

                            if(file.fieldname === "songImage"){
                                destination += "images/songs/";
                            }
                            else if(file.fieldname === "songFile"){
                                destination += "songs/";
                            }

                            callback(null, destination);
                        },
                        filename: function(req, file, callback){
                            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
                        }
                    }),
        fileFilter  = function(req, file, callback){
                        if(file.fieldname === "songImage"){
                            if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
                                return callback(new Error("JPG, JPEG, PNG, GIF file type only!!!"), false);
                            }
                        }
                        else if(file.fieldname === "songFile"){
                            if(!file.originalname.match(/\.(mp3)$/i)){
                                return callback(new Error("MP3 file type only!!!"), false);
                            }
                        }

                        callback(null, true);
                    },
        upload      = multer({storage: storage, fileFilter: fileFilter}),
        middleware  = require("../middleware"),
        SongInfo    = require("../models/songInfo"),
        ArtistInfo  = require("../models/artistInfo"),
        User        = require("../models/user"),
        router      = express.Router();
        

/* Index */

router.post("/search", function(req, res){
    let searched = req.body.searched;
    
    res.redirect("/songs?searched=" + searched);
})

router.get("/", middleware.isAdmin, function(req, res){
    SongInfo.find({$or: [{songName: new RegExp(req.query.searched, "i")}, {artistName: new RegExp(req.query.searched, "i")}]}, function(err, songs){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            if(songs.length === 0){
                SongInfo.find({}, function(err, allSongs){
                    if(err){
                        req.flash("error", err.message);
                        res.redirect("back");
                    }
                    else{
                        res.render("songs/index.ejs", {songs: allSongs});
                    }
                })
            }
            else{
                res.render("songs/index.ejs", {songs: songs});
            }
        }
    })
})

/* New */

router.get("/new", middleware.isAdmin, function(req, res){
    res.render("songs/new.ejs");
});

/* Create */

router.post("/", upload.any([{name: "songImage"}, {name: "songFile"}]), function(req, res){
    let newSong = req.body.newSong;

    req.files.forEach(file => {
        if(file) {
            if(file.fieldname == "songImage") {
                newSong.songImage = "/uploads/images/songs/" + file.filename;
            } else if (file.fieldname == "songFile") {
                newSong.songFile = "/uploads/songs/" + file.filename;
            }
        }
    });

    SongInfo.create(newSong, function(err, song){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            ArtistInfo.findOne({artistName: newSong.artistName}, function(err, artist){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else{
                    artist.songs.push(song);
                    artist.save();
                    req.flash("success", "New song has been added");
                    res.redirect("back");
                }
            })
        }
    })
});

/* Show */

router.get("/:songName", function(req, res){
    SongInfo.findOneAndUpdate({songName: req.params.songName}, {$inc: {popularity: 1}}, function(err, song){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.render("songs/show.ejs", {song: song});
        }
    })
});

/* Edit */

router.get("/:songName/edit", middleware.isAdmin, function(req, res){
    SongInfo.findOne({songName: req.params.songName}, function(err, song){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.render("songs/edit.ejs", {song: song});
        }
    })
});

/* Update */

router.put("/:songName", upload.any([{name: "songImage"}, {name: "songFile"}]), function(req, res){
    let updatedSong = req.body.updatedSong;

    req.files.forEach(file => {
        if(file) {
            if(file.fieldname == "songImage") {
                updatedSong.songImage = "/uploads/images/songs/" + file.filename;
            } else if (file.fieldname == "songFile") {
                updatedSong.songFile = "/uploads/songs/" + file.filename;
            }
        }
    });

    SongInfo.findOneAndUpdate({songName: req.params.songName}, updatedSong, function(err, beforeUpdate){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            if(beforeUpdate.artistName !== updatedSong.artistName)
            {
                // Delete this song from the old artist
                ArtistInfo.findOneAndUpdate({artistName: beforeUpdate.artistName}, {$pull: {songs: beforeUpdate._id}}, function(err, artist){
                    if(err){
                        req.flash("error", err.message);
                        res.redirect("back");
                    }
                    else{}
                })
                // Then add to the new one
                ArtistInfo.findOneAndUpdate({artistName: updatedSong.artistName}, {$push: {songs: beforeUpdate._id}}, function(err, artist){
                    if(err){
                        req.flash("error", err.message);
                        res.redirect("back");
                    }
                    else{}
                })
            }
            res.redirect("/songs");
        }
    })
})

/* Delete */

router.delete("/:songName", function(req, res){
    SongInfo.findOneAndRemove({songName: req.params.songName}, function(err, deletedSong){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            ArtistInfo.findOneAndUpdate({artistName: deletedSong.artistName}, {$pull: {songs: deletedSong._id}}, function(err, artist){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else{}
            })
            User.updateMany({}, {$pull: {favSongs: deletedSong._id}}, function(err, users){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else{}
            })
            
            res.redirect("/songs");
        }
    })
})

/* Favorite */

router.put("/favorite/:songId", function(req, res){
    User.findById(req.user._id, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            SongInfo.findById(req.params.songId, function(err, song){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else{
                    user.favSongs.push(song);
                    user.save();
                    res.redirect("back");
                }
            })
        }
    })
})

/* Unfavorite */

router.put("/unfavorite/:songId", function(req, res){
    User.findByIdAndUpdate(req.user._id, {$pull: {favSongs: req.params.songId}}, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.redirect("back");
        }
    })
})

module.exports = router;