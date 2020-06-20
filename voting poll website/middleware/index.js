//all the middle ware goes here
//decalring the variable as object and adding all the middle ware inside that object
var middlewareObj 	={};

//declaring the campground and comments

var db			= 	 require("../modules");
var db1		=	 require("../modules/index1");



middlewareObj.allowvoting		= function(req, res, next){
		db.voting.findOne({_id : req.params.id},function(err,found){
			if(err || !found)
				{	
					req.flash("error","voting not found");
					res.redirect("back");
					req.flash("error","voting not found");
				}
			if(found)
			{
			return next();
		}
	});
};
	




//to check whether the user logged in or not
middlewareObj.isLoggedIn		 =function(req, res, next){
	if(req.isAuthenticated()){
	   return next();
	   }
		else
			{
		//the word error is the key which is called in login in routes and can becalled in other routes
		req.flash("error","You need to logged in first");
		 res.redirect("/login");
		 req.flash("error","You need to logged in first");
		}
};


middlewareObj.email_verify  = function(req,res,next){

	db1.user.findOne({username : req.body.username}, function(err,found){
		if(err || !found )
		{
			req.flash("error", "Usename or password is incorrect");
			res.redirect("back");
		}
		if(found)
		{
		if(found.email_verified)
			{	
				req.flash("success" ,"Welcome to voting bazzar");
				return next();
			}
		
		req.flash("error", "you need to verify your email account");
		res.redirect("/emailVerify");
		req.flash("error", "You need to verify your email accoutn");
	}
	req.flash("error", "username or password is in correct");
	})
};

	
	



module.exports 	=middlewareObj;
