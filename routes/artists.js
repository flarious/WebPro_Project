const   express     = require("express"),
        multer      = require("multer"),
        path        = require("path"),
        storage     = multer.diskStorage({
                        destination: function(req, file, callback){
                            var destination = "./public/uploads/images/artists/";
                            callback(null, destination);
                        },
                        filename: function(req, file, callback){
                            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
                        }
                    }),
        fileFilter  = function(req, file, callback){
                        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
                            return callback(new Error("JPG, JPEG, PNG, GIF file type only!!!"), false);
                        }

                        callback(null, true);
                    },
        upload      = multer({storage: storage, fileFilter: fileFilter}),
        middleware  = require("../middleware"),
        ArtistInfo  = require("../models/artistInfo"),
        SongInfo    = require("../models/songInfo"),
        User        = require("../models/user"),
        router      = express.Router();

/* Index */

router.post("/search", function(req, res){
    let searched = req.body.searched;

    res.redirect("/artists?searched=" + searched);
})

router.get("/", middleware.isAdmin, function(req, res){
    ArtistInfo.find({artistName: new RegExp(req.query.searched, "i")}, function(err, artists){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            if(artists.length === 0){
                ArtistInfo.find({}, function(err, allArtists){
                    if(err){
                        req.flash("error", err.message);
                        res.redirect("back");
                    }
                    else{
                        res.render("artists/index.ejs", {artists: allArtists});
                    }
                })
            }
            else{
                res.render("artists/index.ejs", {artists: artists});
            }
        }
    })
})

/* New */

router.get("/new", middleware.isAdmin, function(req, res){
    res.render("artists/new.ejs");
});

/* Create */

router.post("/", upload.single("artistImage"), function(req, res){
    let newArtist = req.body.newArtist;

    if(req.file){
        newArtist.artistImage = "/uploads/images/artists/" + req.file.filename;
    }

    newArtist.contacts = req.body.contacts;

    ArtistInfo.create(newArtist, function(err, artist){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            req.flash("success", "New artist has been added");
            res.redirect("back");
        }
   })
});

/* Show */

router.get("/:artistName", function(req, res){
    ArtistInfo.findOne({artistName: req.params.artistName}).populate("songs").exec(function(err, artist){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.render("artists/show.ejs", {artist: artist});
        }
    })
});

/* Edit */

router.get("/:artistName/edit", middleware.isAdmin, function(req, res){
    ArtistInfo.findOne({artistName: req.params.artistName}, function(err, artist){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.render("artists/edit.ejs", {artist: artist});
        }
    })
});

/* Update */

router.put("/:artistName", upload.single("artistImage"), function(req, res){
    let updatedArtist = req.body.updatedArtist;

    if(req.file){
        updatedArtist.artistImage = "/uploads/images/artists/" + req.file.filename;
    }
    
    updatedArtist.contacts = req.body.contacts;

    ArtistInfo.findOneAndUpdate({artistName: req.params.artistName}, updatedArtist, function(err, beforeUpdate){
        if(err){
            req.flash("error", err.message);
            res.redirect("/artists/" + req.params.artistName + "/edit");
        }
        else{
            if(beforeUpdate.artistName !== updatedArtist.artistName){
                SongInfo.updateMany({artistName: beforeUpdate.artistName}, {artistName: updatedArtist.artistName}, function(err, songs){
                    if(err){
                        req.flash("error", err.message);
                    }
                    else{}
                })
            }
            res.redirect("/artists");
        }
    })
})

/* Delete */

router.delete("/:artistName", function(req, res){
    ArtistInfo.findOneAndRemove({artistName: req.params.artistName}, function(err, deletedArtist){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            SongInfo.deleteMany({artistName: deletedArtist.artistName}, function(err, deletedSong){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else{}
            })
            User.updateMany({}, {$pull: {favArtists: deletedArtist._id}}, function(err, users){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else{}
            })

            res.redirect("/artists");
        }
    })
})

/* Favorite */

router.put("/favorite/:artistId", function(req, res){
    User.findById(req.user._id, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            ArtistInfo.findById(req.params.artistId, function(err, artist){
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else{
                    user.favArtists.push(artist);
                    user.save();
                    res.redirect("back");
                }
            })
        }
    })
})

/* Unfavorite */

router.put("/unfavorite/:artistId", function(req, res){
    User.findByIdAndUpdate(req.user._id, {$pull: {favArtists: req.params.artistId}}, function(err, user){
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