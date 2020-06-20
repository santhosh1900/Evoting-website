var express  	= require("express");

//var routher is used because .Router() will exports these routers  to app.js page
var router	 	=     express.Router();
var voting     =    require("../modules/voting"),
    user        =   require("../modules/user"),
    db          =   require("../modules"),
    middleware      =    require("../middleware");



// FUNCTION USED FOR ACCEPTING THE images FROM THE USER COMPUTER


//this whole set of lines is the require lines which used to upload images from the user side

var multer = require('multer');

//creating the storage for the uploaded files and save its name as ceated date nf orginal file name 

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 



    //these vaues are get from the clouinary dshboard
  cloud_name: 'your cloudinary cloud_name', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});





//INDEX - show all voting pools


router.get("/", function(req, res){
	//pagination settings
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    //fuzz search function implementation
		// fuzz search function is written in tha last
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        db.voting.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allvotings) {
            db.voting.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allvotings.length < 1) {
                        noMatch = "No votings match that query, please try again.";
                    }
                    res.render("votings/votings", {
                        votings 			    : 	allvotings,
                        current 				: 	pageNumber,
                        pages 					: 	Math.ceil(count / perPage),
                        nomatch 				: 	noMatch,
                        search 					: 	req.query.search
                    });
                }
            });
        });
    } else {

        db.voting.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allvotings) {
            db.voting.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("votings/votings", {
                        votings : allvotings,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        nomatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});




// ================================
// form to create a new voting page
// ===============================
router.get("/new",middleware.isLoggedIn, function(req,res){
    res.render("votings/new");
});


// ===========================================
// to show a particular voting panel
// =================================================

router.get("/:id", middleware.allowvoting ,function(req,res){
    db.voting.findById(req.params.id,function(err,foundele){
        if(err)
        {
            res.redirect("back");
        }
        res.render("votings/show",{voting : foundele});
    })

});


// =================================
// route to add vote 
// =====================================


router.post("/:id/addvotes", middleware.isLoggedIn , function(req,res){
    var id = req.params.id;
    var false_vote = false;
    db.voting.find({"contestants._id" : id },function(err,found){
        var user_id = req.user.id;
        if(err)
        {
            // res.redirect("back");
            console.log(err);
        }
        var number_of_voters = found[0].voters.length;
        for(var i=0 ; i<=number_of_voters ;i++)
        {
            if(found[0].voters[i] == user_id)
            {
                false_vote = true;
                break;
            }
        }
        if(false_vote == true)
        {
            req.flash("error","you can vote only one time");
            res.redirect("back");

        }
        else
        {
        var n  = Number(found[0].total_contestants);
        for(var i = 0 ; i<n ; i++)
        {
            if(found[0].contestants[i]._id == id)
            {
               found[0].contestants[i].votes.push(req.user);
               found[0].voters.push(req.user);
               found[0].save();
            }
        }
        res.redirect("back");
    }
})
});




// ===================================
// creating the new contestants
// ======================

router.post("/new", middleware.isLoggedIn , upload.single('image') ,function(req,res){


    cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
        if(err){
            req.flash("error",err.message);
            return res.redirect("back");
        }
    //gettting info fromm form and it to the compound array
    var name                 =   req.body.name;
     // add cloudinary url for the image to the voting object under image property
    var image                = result.secure_url;
    var imageId              = result.public_id;
    var desc                 = req.body.description;
    var total_contstants     = req.body.total_contstants;
    var total_contestants    = Number(req.body.total_contestants);
    var created_at           = new Date();
    var closing_at           = new Date(created_at);
    closing_at.setDate(created_at.getDate() + 1); 
        //creating the object and pushing into the exesting voting array
    var newelection = {
     name :name ,
     desc  :desc,
     image : image ,
     imageId : imageId  ,
     created_at : created_at,
     closing_at : closing_at,
     total_contestants : total_contestants };
    //creat a new campground and save it to the database
    db.voting.create(newelection ,function(err,newele){
        if(err){
            console.log(err || !newele);
            res.redirect("back");
        }
        else{
            req.flash("success","Election successfully created");
            //redirecting back to the compounf page
            res.redirect("/voting/new/"+newele._id +"/contestants_form");
        }
    }
);
});
});

// =========================================

// contestant form creating
// ===================================

router.get("/new/:id/contestants_form" , middleware.isLoggedIn ,function(req,res){
    db.voting.findById(req.params.id,function(err,foundele){
        if(err)
        {
            console.log(err);
        }
        res.render("votings/contestants_entry_form",{voting  : foundele})
    })

});

router.post("/new/:id/contestants_form", middleware.isLoggedIn ,function(req,res){
   db.voting.findOne({_id : req.params.id}).populate("contestants").exec(function(err,voting){
        if(err)
        {
            console.log(err);
            voting.remove();
        }
       var n  = voting.total_contestants;
       for(var i=0; i < n ;i++)
       {
        var contestant_name ={
            name  :req.body.name[i],
            votes  :[]
        } 

        voting.contestants.push(contestant_name);
        voting.save();
       }
      console.log(voting)
      voting.save();

        res.redirect("/voting");

    })

});







// ============================================================================================================

// fuzz search function

// FUZZ SEARCH FUNCTION
// ====================================================================
    function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
    
    
module.exports = router;