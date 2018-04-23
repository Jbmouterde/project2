const express = require("express");
const bcrypt = require("bcrypt")
const router = express.Router();
const User = require("../models/user-model")
// new require 
const passport = require("passport");

// upload image 
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_key,
  api_secret: process.env.cloudinary_secret
});

const storage = cloudinaryStorage({ cloudinary, folder: "project2" });

const upload = multer({ storage });

// ROUTES HERE ------------------------------------------
//CREATION OF THE FORM OF SIGNUP 

router.get("/signup", (req, res, next)=>{
res.render("auth-views/signup-form")
});

// SUBMIT THE FORM 
router.post('/process-signup',upload.single("image"),  (req,res, next)=>{
  const {firstName, username,name, email, password} = req.body;
  const { originalname, secure_url } = req.file;

  // password can't be blank and required a number
  if (password === "" || password.match(/[0-9]/)=== null){
    // FLASH req.flash is defined by the flash package
    // req.flash("TYPE", "MESSAGE");
    // req.flash("error", "Your password must have at least a number");
    res.redirect("/");
    return 
  }

  const salt = bcrypt.genSaltSync(10);
  const encryptedPassword = bcrypt.hashSync(password, salt);

User.create({firstName,username,name, email, encryptedPassword,  imageName: originalname,
    imageUrl: secure_url,})
.then (()=>{
  // req.flash("sucess", "You have a signed up! Try logging in.");
  res.redirect("/");
})
.catch ((err)=>{
  next(err)
});
});


// ABOUT LOGIN 

router.get("/login", (req,res,next)=>{
  res.render("auth-views/login-form")
}); 

router.post("/process-login", (req,res,next)=>{
  const {username, password} = req.body
// check the email // db query 
User.findOne({username})
.then((userDetails)=>{
  // "userdetail" is false 
  if(!userDetails){
    req.flash("error", "Wrong Email.");
    res.redirect("/login");
    return 
  }

  const {encryptedPassword} = userDetails;
 if (!bcrypt.compareSync(password, encryptedPassword)){
  req.flash("error", "Wrong Password.");
  res.redirect("/login")
  return ;
 }

   // new session // passport Stuff // "req.login" is passport's method for loggin a user in 
   req.login(userDetails, ()=>{
    req.flash("sucess", "Log in successful!");
   res.redirect("/home-user");
  });
})
.catch((err)=>{
  next(err)
});
});

router.get("/logout", (req, res, next)=>{
  // "req.logout" is passport's method for logging a user out 
  req.logout();
  req.flash("sucess", "Log out sucessful!");
  res.redirect("/");
});
//
router.post("/process-adding", (req,res,next)=>{
  res.render("auth-views/login-form")
}); 


module.exports = router; 