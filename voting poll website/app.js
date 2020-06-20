
require('dotenv').config()
var express          = require("express"),
	 app             = express(),
	 bodyparser      = require("body-parser"),
	 mongoose        = require("mongoose"),
	flash			 = require("connect-flash"),
	passport         = require("passport"),       //passport is for authentication purpose ie signup  login ,,and logout
	LocalStrategy    = require("passport-local"),
	methodoverride	 = require("method-override"),
	voting 			 = require("./modules/voting"),
	user 			 = require("./modules/user");

var voting_poll = require("./routes/voting_poll");
var	authRoutes		 = require("./routes/auth");

	//mongoose installing lines
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

// eneter your mongo username in the place ---->       xxx
// enter your mongo password in the place of ------>   password
// you can get this from mongodb website afte you create your account


mongoose.connect("mongodb+srv://xxx:password@cluster0-5oi1t.mongodb.net/test?retryWrites=true&w=majority",{
	useNewUrlParser: true,
	useCreateIndex : true	
}).then(() =>{
	console.log("connected to db cluster");
}).catch(err =>{
	console.log("error",err.message);
});



//using the methoe override
app.use(methodoverride("_method"));

//using the flash
app.use(flash());


app.use(bodyparser.urlencoded({extended: true}));

//its is to elemiate the use of ejs extension and views directory path
app.set("view engine","ejs");

//this __dirname is the directory root path of this app.js file so it will elemate of tying the long directory paths
app.use(express.static(__dirname+"/public"));

//running the seed function
// seedDB();


// moment configuraion

app.locals.moment = require('moment');

//passport configuration
app.use(require("express-session")({
	secret 				: "typer your secrete code",
	resave 				:  false,
	saveUninitialized	: false
}));
//in this 5 lines of passport config user. this user is reffer to line 11
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//this function is use to implement currentuser variable to all route and ejs files
app.use(function(req,res,next){
	res.locals.currentuser = req.user; //req.user means current user requesting the info from our web page
	res.locals.error	   = req.flash("error");
	res.locals.success	   = req.flash("success");
	next();
});


app.get("/",function(req,res){
	res.render("landing");
});

app.use(authRoutes);
app.use("/voting",voting_poll);












app.listen(process.env.PORT || 3000, process.env.IP,function(){
	console.log("connected");
})