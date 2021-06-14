const   express     = require("express"),
        multer      = require("multer"),
        path        = require("path"),
        storage     = multer.diskStorage({
                        destination: function(req, file, callback){
                            var destination = "./public/uploads/images/users/";
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
        User        = require("../models/user"),
        router      = express.Router();

/* Index */

router.post("/search", function(req, res){
    let searched = req.body.searched;
    
    res.redirect("/users?searched=" + searched);
})

router.get("/", middleware.isAdmin, function(req, res){
    User.find({$and: [{username: new RegExp(req.query.searched, "i")}, {rank: {$ne: "admin"}}]}, function(err, users){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }   
        else{
            if(users.length === 0)
            {
                User.find({rank: "user"}, function(err, allUsers){
                    if(err){
                        req.flash("error", err.message);
                        res.redirect("back");
                    }
                    else{
                        res.render("users/index.ejs", {users: allUsers});
                    }
                })
            }
            else{
                res.render("users/index.ejs", {users: users});
            }
        }
    })
})

/* Show */

router.get("/:userId", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.userId).populate("favSongs favArtists").exec(function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.render("users/show.ejs", {user: user});
        }
    })
});

/* Edit */

router.get("/:userId/edit", middleware.isLoggedIn, function(req, res){
    if(req.params.userId != req.user._id){
        req.flash("error", "you are not supposed to be here");
        res.redirect("back");
    }
    else{
        User.findById(req.params.userId).populate("favSongs favArtists").exec(function(err, user){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            }
            else{
                res.render("users/edit.ejs", {user: user});
            }
        })
    }
});

/* Update */

router.put("/:userId", upload.single("image"), function(req, res){
    let updatedUser = req.body.updatedUser;

    if(req.file){
        updatedUser.image = "/uploads/images/users/" + req.file.filename;
    }

    User.findByIdAndUpdate(req.params.userId, updatedUser, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            res.redirect("/users/" + req.params.userId);
        }
    })
})

/* Delete */

router.delete("/:userId", function(req, res){
    User.findByIdAndRemove(req.params.userId, function(err, deletedUser){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            if(req.user.rank === "admin"){
                res.redirect("back");
            }
            else{
                res.redirect("/");
            }
        }
    })
})

module.exports = router;