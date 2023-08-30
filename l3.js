require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const app = express();
const encrypt = require('mongoose-encryption');
const md5 = require('md5');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(("publlic")));



mongoose.connect("mongodb://localhost:27017/userDB").catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret="this is my secret";
// we dont have to do any thing to encrypt and decrypt the password except this 
userSchema.plugin(encrypt,{secret : process.env.SECRET ,encryptedFields : ["password"]});
// mongoose auto matically encrypt the password during sava user and it will auto matically decrypt the password during find operation
const User = new mongoose.model("User", userSchema);




app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});




app.post("/register", async (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    await newUser.save().catch(err => console.log(err)).then(res.render("secrets"))
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = md5(req.body.password);
    const foundUser = await User.findOne({ email: username }).exec();
    if(foundUser){
        if(foundUser.password===password){
            res.render("secrets");
        }
    }
});







app.listen(process.env.PORT, () => {
    console.log(`server is hosted on http://localhost:${process.env.PORT}`);
})