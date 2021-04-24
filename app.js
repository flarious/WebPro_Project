const express = require('express');
let app = express();

app.use(express.static('scripts'));
app.use(express.static('images'));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render("home.ejs", {user_id: '-1'});
});

app.get('/user/:id', function(req, res){
    let user_id = req.params.id;
    res.render("home.ejs", {user_id: user_id});
});


app.get('/searchResults/:search', function(req,res){
    let searched = req.params.search;
    res.render("searchResults.ejs", {user_id: '-1', searched: searched});
});

app.get('/user/:id/searchResults/:search', function(req,res){
    let user_id = req.params.id;
    let searched = req.params.search;
    res.render("searchResults.ejs", {user_id: user_id, searched: searched});
});
/*
app.get('/user/:id/premium', function(req, res){
    res.render("");
})
*/
app.listen('3000', function(req, res){
    console.log("Server is running");
});