var mongoose				= require("mongoose"),

	passportlocalmongoose	= require("passport-local-mongoose");

var userschema = new mongoose.Schema({

	username 			: {type  :String , unique:true , required  :true},
	password 			: String,
	firstname			: String,
	lastname 				: String,
	email					: {type : String , unique : true, required : true},
	isAdmin	 			 :   {type : Boolean , default:false},
	email_verified 		 : {type : Boolean , default : false},
	email_verified_token : String,  
	email_verified_reset : Date,
});



//pluging the passportlocalmongoose to usserschema for authentication purpose
userschema.plugin(passportlocalmongoose);

//converting the schema to model
var user = mongoose.model("user", userschema);

// exporting that model
 module.exports = user;