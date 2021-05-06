const express = require('express');
let app = express();

app.use(express.static('scripts'));
app.use(express.static('images'));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render("home.ejs", {user_id: '-1'});
});

app.get('/user/:user_id', function(req, res){
    let user_id = req.params.user_id;
    res.render("home.ejs", {user_id: user_id});
});


app.get('/searchResults/:search', function(req, res){
    let user_id = '-1';
    let searched = req.params.search;
    res.render("searchResults.ejs", {user_id: user_id, searched: searched});
});

app.get('/user/:id/searchResults/:search', function(req, res){
    let user_id = req.params.id;
    let searched = req.params.search;
    res.render("searchResults.ejs", {user_id: user_id, searched: searched});
});

app.get('/songInfo/:song_id', function(req, res){
    let user_id = '-1';
    let song_id = req.params.song_id;
    res.render("infoSong.ejs", {user_id: user_id, song_id: song_id});
});

app.get('/artistInfo/:artist_id', function(req, res){
    let user_id = '-1';
    let artist_id = req.params.artist_id;
    res.render("infoArtist.ejs", {user_id: user_id, artist_id: artist_id});
});

app.get('/genreInfo/:genre_id', function(req, res){
    let user_id = '-1';
    let genre_id = req.params.genre_id;
    res.render("infoGenre.ejs", {user_id: user_id, genre_id: genre_id});
});

app.get('/userInfo/:user_id', function(req, res){
    let user_id = req.params.user_id;
    res.render("infoUser.ejs", {user_id: user_id});
});

app.get('/userInfo/:user_id/edit', function(req, res){
    let user_id = req.params.user_id;
    res.render("infoUser_edit.ejs", {user_id: user_id});
});

app.get('/playlist/:playlist_id', function(req, res){
    let user_id = '-1';
    let playlist_id = req.params.playlist_id;
    res.render("playlist.ejs", {user_id: user_id, playlist_id: playlist_id});
});

app.get('/user/:id/upgrade', function(req, res){
    let user_id = req.params.user_id;
    res.render("toPremium.ejs", {user_id: user_id});
});

app.get('/signIn', function(req, res){
    res.render("signIn.ejs");
});

app.get('/signUp', function(req, res){
    res.render("signUp.ejs");
});

app.get('/resetPassword', function(req, res){
    res.render("resetPassword.ejs");
});

app.get('/changePassword', function(req, res){
    res.render("changePassword.ejs");
});

app.get('/confirmEmail', function(req, res){
    res.render("emailConfirmation.ejs");
});

app.listen('3000', function(req, res){
    console.log("Server is running");
});