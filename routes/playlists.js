const   express     = require("express"),
        middleware  = require("../middleware"),
        User        = require("../models/user"),
        router      = express.Router();

/* Index */

router.get("/", middleware.isLoggedIn, function(req, res){
    /* No playlist database to find playlists*/
    res.render("playlists/index.ejs");
})

/* Show */

router.get("/:playlistName", middleware.isLoggedIn, function(req, res){
    if(req.params.playlistName === "favorite"){
        User.findById(req.user._id).populate("favSongs").exec(function(err, fav){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }
            else{
                res.render("playlists/show.ejs", {playlist: fav});
            }
        })
    }
})

module.exports = router;