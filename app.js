require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
//hassing
// const md5 = require('md5');
//encrypting
// const encrypt = require('mongoose-encryption');
//hassing and salting 
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
//cookies 
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const passportLocal = require('passport-local');
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static(("publlic")));
//cookies
app.use(session({
    secret : "IamNoob",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());

app.use(passport.session());

const uri = "mongodb+srv://"+process.env.USER_ID+":"+process.env.USER_PASSWORD+"@cluster0.zswynvi.mongodb.net";
mongoose.connect(uri+"/userDB").catch(err=>console.log(err));

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    secret : String
});

//this step is used to encrypt the and decrypt the password automatically.
// userSchema.plugin(encrypt,{secret : process.env.SECRET ,encryptedFields : ["password"]});


//cookies
userSchema.plugin(passportLocalMongoose)
const User = new mongoose.model('User',userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home");
});
app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.get("/secrets",async(req,res)=>{
    // if(req.isAuthenticated()){
    //     res.render("secrets");
    // }else{
    //     res.redirect("/login");
    // }
    const foundUser = await User.find({"secret": {$ne : null}});
    if(foundUser){
        res.render("secrets",{usersWithSecrets : foundUser});
    }
})

app.get("/logout",(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})
app.get("/submit",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.render("/login");
    }
})
app.post("/submit",async (req,res)=>{
    const submitedSecret = req.body.secret;
    const foundUser = await User.findById(req.user.id).exec();
    if(foundUser){
        foundUser.secret = submitedSecret;
        await foundUser.save();
        res.redirect("/secrets");
    }
})
app.post("/register",(req,res)=>{
    // hassing and salting
    // bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
    //     const newUser = new User({
    //         email : req.body.username,
    //         password : hash
    //     });
    //         await newUser.save().catch(err=>console.log(err));
    // });
    
    User.register({username : req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })
});
app.post("/login",async (req,res)=>{
    //hassing and salting
    // const username = req.body.username;
    // const password = req.body.password;
    //     const foundUser = await User.findOne({email : username}).exec();
    //     if(foundUser){
    //         bcrypt.compare(password, foundUser.password, function(err, result) {
    //             // result == true
    //             if(result==true)
    //                 res.render("secrets"); 
    //             else{
    //                 console.log("User is not present.")
    //             }
    //         });       
    //     }

    const user=new User({
        username : req.body.username,
        password : req.body.password
    })
    req.login(user,(err)=>{
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            })
        }
    })

});



app.listen(process.env.PORT,()=>{
    console.log(`server is hosted on http://localhost:${process.env.PORT}`);
})