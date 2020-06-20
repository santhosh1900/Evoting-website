var express  	   	=    require("express");

//var routher is used because .Router() will exports this routers to app.js page
var router	 		  =    express.Router();
var passport		  =    require("passport");
var user			    =    require("../modules/user");
var db            =    require("../modules/index1")
var voting        =     require("../modules/voting");
var middleware    =    require("../middleware");
var async		    	=    require("async");
var nodemailer    =    require("nodemailer");


//crypto is inbuilt npm pavkages of express so no need for installation
var crypto		  	=    require("crypto");


// ============================
//auth routs
// =======================


// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});




//handle sign up logic

router.post("/register", function(req,res){
  var newUser = new user(
    {
      username                 : req.body.username,
      firstname                : req.body.firstname,
      lastname                 : req.body.lastname,
      email                    : req.body.email,
      email_verified          : false,
      email_verified_token    : undefined,  
      email_verified_reset    : undefined,
    });
  if(req.body.adminCode === "secret1234"){
    db.newUser.isAdmin = true;
  }
  //.register is the inbulit function of passport
  db.user.register(newUser, req.body.password,function(err,user){
    
    if(err){
        console.log(err);
        return res.render("register", {error: err.message});
      }
    
    else{
      passport.authenticate("local")(req,res,function(){
        req.flash("success","Your is successfully created");
        req.logout();
        res.redirect("/voting")
      })
    }
  })
});





//show login form

router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});


//login logics

//handle login logics ,line after the /register is middleware syantax and the word local is the name of the strategy we r using


router.post("/login" , middleware.email_verify , passport.authenticate("local",
  { 
    successRedirect: "/voting",
    failureRedirect: "/login"
  }) , function(req,req){ 
  
});



// THIS IS THE EMAIL VERIFICATION ROUTE 
// TO PREVENT THE CREATION OF FAKE USERS AND EMAIL


router.get("/emailVerify" , function(req,res){
  res.render("emailverify");

});





// EMAIL VERIFICATION LOGIC


router.post('/emailVerify', function(req, res, next) {

  async.waterfall([

    function(done) {

      crypto.randomBytes(20, function(err, buf) {

        var token = buf.toString('hex');

        done(err, token);

      });

    },

    function(token, done) {

      db.user.findOne({ email: req.body.email }, function(err, user) {

        if (!user) {

          req.flash('error', 'No account with that email address exists.');

          return res.redirect('back');

        }



        user.email_verified_token = token;

        user.email_verified_reset = Date.now() + 600000; // 1 hour



        user.save(function(err) {

          done(err, token, user);

        });

      });

    },

    function(token, user, done) {

      var smtpTransport = nodemailer.createTransport({

        service: 'Gmail', 
          //we must madde this account to all less secure apps in oder to make this rest function work
        auth: {

          user: "ENTER YOUR OWN EMAIL ID HERE",

          // IN ORDER TO THIS ROUTE WORK YOU MUST ON THE ---> ALLOW LESS Secure app option in your mail
          // other wise this website will craash
          // because we r running our website in http NOT https so http is less secure 

          pass: process.env.GMAILPW
          // .refer .env file for Gmailpw

        }

      });

      var mailOptions = {

        to: user.email,

        from: 'enter the same email id',

        subject: 'Voting bazzar email verfication',

        text: 'You are receiving this because you (or someone else) have requested to verify your email account.\n\n' +

          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +

          'http://' + req.headers.host + '/emailverify/' + token + '\n\n' +

          'If you did not request this, please ignore this email and your password will remain unchanged.\n'

      };

      smtpTransport.sendMail(mailOptions, function(err) {

        console.log('mail sent');

        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');

        done(err, 'done');

      });

    }

  ], function(err) {

    if (err) return next(err);

    res.redirect('back');

  });

});


// ======================================
// verficition process
// ====================================


router.get('/emailverify/:token', function(req, res) {

  async.waterfall([

    function(done) {

      db.user.findOne({ email_verified_token: req.params.token, email_verified_reset: { $gt: Date.now() } }, function(err, user) {

        if (!user) {

          req.flash('error', 'Email verification token is invalid or has expired.');

          return res.redirect('back');

        }


        user.email_verified = true;

        user.email_verified_token = "dsad",

        user.email_verified_reset  = Date.now();

        user.save(function(err){

          req.logIn(user,function(err){

            done(err,user);

          })

        });

      });

    },

    function(user, done) {

      var smtpTransport = nodemailer.createTransport({

        service: 'Gmail', 

        auth: {

          user: 'enter the your email',

          pass: process.env.GMAILPW

        }

      });

      var mailOptions = {

        to: user.email,

        from: 'enter your mail',

        subject: 'Your email has been verified',

        text: 'Hello,\n\n' +

          'This is a confirmation that the email for your account ' + user.email + ' has just been verified.\n'

      };

      smtpTransport.sendMail(mailOptions, function(err) {

        req.flash('success', 'Success! Your email has been verified.');

        done(err);

      });

    }

  ], function(err) {

    res.redirect('/voting');

  });

});







//log out route
router.get("/logout",function(req,res){
  //.logout is the inbulit function of passport
  req.logout();
  res.redirect("back");
});





module.exports = router;