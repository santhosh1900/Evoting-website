var mongoose = require("mongoose");
mongoose.set("debug",true);

//mongoose installing lines
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);


// eneter your mongo username in the place ---->       xxx
// enter your mongo password in the place of ------>   password


mongoose.connect("mongodb+srv://xxx:password@cluster0-5oi1t.mongodb.net/test?retryWrites=true&w=majority",{
	useNewUrlParser: true,
	useCreateIndex : true	
}).then(() =>{
	console.log("connected to db cluster");
}).catch(err =>{
	console.log("error",err.message);
});

mongoose.Promise = Promise;

module.exports.user  = require("./user");