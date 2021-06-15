const   express     = require("express"),
        passport    = require("passport"),
        User        = require("../models/user"),
        SongInfo    = require("../models/songInfo"),
        middleware  = require("../middleware"),
        router      = express.Router();

/* Home */

router.get("/", function(req, res){
    if(req.isAuthenticated() && req.user.rank === "admin")
    {
        res.render("admin.ejs");
    }
    else{
        SongInfo.find({}, function(err, songs){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }
            else{
                res.render("home.ejs", {songs: songs});
            }
        })
    }
});

/* Search */

router.post("/search", function(req, res){
    let searched = req.body.searched;
    if(searched === "")
    {
        searched += "-";
    }
    res.redirect("/searchResults/" + searched + "/sortBySong");
})

router.get("/searchResults/:searched/:sortBy", function(req, res){
    var searched = req.params.searched;
    var sortBy = req.params.sortBy;

    if(req.isAuthenticated() && req.user.rank === "admin")
    {
        res.redirect("back");
    }

    SongInfo.find({$or: [{songName: new RegExp(searched, "i")}, {artistName: new RegExp(searched, "i")}]}, function(err,songs){
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
                        if(sortBy === "sortBySong"){
                            res.render("searchResults.ejs", {songs: allSongs, sortBySong: true});
                        }
                        else if(sortBy === "sortByArtist"){
                            res.render("searchResults.ejs", {songs: allSongs, sortBySong: false});
                        }
                    }
                })
            }
            else{
                if(sortBy === "sortBySong"){
                    res.render("searchResults.ejs", {songs: songs, sortBySong: true});
                }
                else if(sortBy === "sortByArtist"){
                    res.render("searchResults.ejs", {songs: songs, sortBySong: false});
                }
            }
        }
    });
});

router.post("/sortSearch", function(req, res){
    var sortBy = req.body.sortBy;
    var path = req.body.url;
    path = path.replace(path.slice(path.lastIndexOf("/")), "/" + sortBy);
    res.redirect(path);
});

/* Premium */

router.get("/premium", middleware.isUser, function(req, res){
    res.render("premium.ejs");
})

router.put("/premium", function(req, res){
    User.findByIdAndUpdate(req.user._id, {rank: "premium"}, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.redirect("/");
        }
    })
})

/* Sign In */

router.get("/signIn", function(req, res){
    res.render("signIn.ejs");
})

router.post("/signIn", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/signIn",
        successFlash: true,
        failureFlash: true,
        successFlash: "Logged in",
        failureFlash: "Invalid username or password"
    }), function(req, res){}
);

/* Sign Up */

router.get("/signUp", function(req, res){
    res.render("signUp.ejs");
});

router.post("/signUp", function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var rePassword = req.body.rePassword;
    var email = req.body.email;
    
    if(password !== rePassword)
    {
        req.flash("error", "Your password doesn't match. Please try again");
        res.redirect("back");
    }

    var newUser = new User({username: username, email: email});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("signUp.ejs");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        })
    })
});

/* Sign Out */

router.get("/signOut", function(req, res){
    req.logout();
    res.redirect("/");
});

module.exports = router;