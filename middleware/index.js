var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You need to sign in first!');
    res.redirect('/signIn');
}

middlewareObj.isAdmin = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.rank === "admin"){
            return next();
        }
    }
    else{
        req.flash('error', 'You are not the one with POWER!!');
        res.redirect('back');
    }
}

middlewareObj.isUser = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.rank === "user"){
            return next();
        }
    }
    else{
        req.flash('error', 'You are not belong here, noble');
        res.redirect('back');
    }
}

module.exports = middlewareObj;