const   express         = require('express'),
        bodyParser      = require('body-parser'),
        passport        = require('passport'),
        LocalStrategy   = require('passport-local'),
        mongoose        = require('mongoose'),
        flash           = require('connect-flash'),
        methodOverride  = require('method-override'),
        User            = require('./models/user'),
        app             = express();

var artistsRoutes   = require('./routes/artists'),
    songsRoutes     = require('./routes/songs'),
    usersRoutes     = require('./routes/users'),
    playlistsRoutes = require('./routes/playlists'),
    indexRoutes     = require('./routes/index');

mongoose.connect('mongodb://localhost/orpheus');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');

/* Session */

app.use(require('express-session')({
    secret: 'secretsss',
    resave: false,
    saveUninitialized: false
}));

/* Authentication */

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
})

/* Router */

app.use('/', indexRoutes);
app.use('/artists', artistsRoutes);
app.use('/songs', songsRoutes);
app.use('/users', usersRoutes);
app.use('/playlists', playlistsRoutes)

/* Port */

app.listen('3000', function(req, res){
    console.log("Server is running");
});